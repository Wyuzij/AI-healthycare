import { Router } from 'express'
import { randomUUID } from 'crypto'
import db from '../db.js'
import { auth } from '../middleware/auth.js'

const router = Router()
const ok = (data, msg = '操作成功') => ({ code: '200', msg, data, message: msg, success: true })
const fail = (msg) => ({ code: '500', msg, success: false })

// 分类列表（扁平，非树形）
router.get('/knowledge/category/tree', (_req, res) => {
  try {
    const cats = db.prepare(`
      SELECT c.id, c.categoryName, c.description, c.sortOrder, c.status, c.statusText,
        (SELECT COUNT(*) FROM knowledge_article WHERE categoryId = c.id) as articleCount,
        c.createdAt, c.updatedAt
      FROM knowledge_category c
      ORDER BY c.sortOrder ASC, c.id ASC
    `).all()
    res.json(ok(cats))
  } catch (e) {
    res.json(fail(e.message))
  }
})

// 文章分页
router.get('/knowledge/article/page', (req, res) => {
  try {
    const pn = Number(req.query.page) || 1
    const ps = Number(req.query.pageSize) || 10
    const offset = (pn - 1) * ps
    const { title, categoryId, status } = req.query
    const conditions = []
    const params = []

    if (status === 'all' || status === '') {
      // 不筛选
    } else if (status !== undefined && status !== null) {
      conditions.push('a.status = ?')
      params.push(Number(status))
    } else {
      conditions.push('a.status = 1')
    }
    if (title) { conditions.push('a.title LIKE ?'); params.push(`%${title}%`) }
    if (categoryId) { conditions.push('a.categoryId = ?'); params.push(Number(categoryId)) }

    const where = conditions.length ? conditions.join(' AND ') : '1=1'

    const records = db.prepare(`
      SELECT a.id, a.categoryId, a.categoryName, a.title, a.summary, a.tags,
        a.authorName, a.coverImage, a.readCount, a.status, a.statusText,
        a.isFavorited, a.favoriteCount, a.createdAt, a.updatedAt
      FROM knowledge_article a WHERE ${where}
      ORDER BY a.createdAt DESC LIMIT ? OFFSET ?
    `).all(...params, ps, offset)

    const total = db.prepare(`SELECT COUNT(*) as count FROM knowledge_article a WHERE ${where}`).get(...params).count
    const pages = Math.ceil(total / ps)

    res.json(ok({ records, total, size: ps, current: pn, pages }))
  } catch (e) {
    res.json(fail(e.message))
  }
})

// 文章详情
router.get('/knowledge/article/:id', (req, res) => {
  try {
    const article = db.prepare(`
      SELECT a.* FROM knowledge_article a WHERE a.id = ?
    `).get(req.params.id)
    if (!article) return res.json(fail('文章不存在'))
    db.prepare('UPDATE knowledge_article SET readCount = readCount + 1 WHERE id = ?').run(req.params.id)
    res.json(ok(article))
  } catch (e) {
    res.json(fail(e.message))
  }
})

// 创建文章
router.post('/knowledge/article', auth, (req, res) => {
  try {
    const { title, content, summary, categoryId, categoryName, tags, coverImage, status } = req.body
    const id = randomUUID()
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const st = status !== undefined ? Number(status) : 0
    const stText = st === 1 ? '已发布' : '待发布'
    const catName = categoryName || (categoryId ? (db.prepare('SELECT categoryName FROM knowledge_category WHERE id = ?').get(categoryId)?.categoryName || '') : '')
    const authorName = req.user.username || ''

    db.prepare(`
      INSERT INTO knowledge_article (id, categoryId, categoryName, title, summary, content, tags, coverImage, authorId, authorName, status, statusText, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, categoryId || null, catName, title, summary || '', content || '', tags || '', coverImage || '', req.user.userId, authorName, st, stText, now, now)

    res.json(ok({ id }))
  } catch (e) {
    res.json(fail(e.message))
  }
})

// 更新文章
router.put('/knowledge/article/:id', auth, (req, res) => {
  try {
    const { title, content, summary, categoryId, categoryName, tags, coverImage, status } = req.body
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const sets = ['title = ?', 'content = ?', 'summary = ?', 'tags = ?', 'coverImage = ?', 'updatedAt = ?']
    const params = [title, content, summary || '', tags || '', coverImage || '', now]

    if (categoryId !== undefined) { sets.push('categoryId = ?'); params.push(categoryId) }
    if (categoryName) { sets.push('categoryName = ?'); params.push(categoryName) }
    if (status !== undefined) {
      sets.push('status = ?'); sets.push('statusText = ?')
      const st = Number(status)
      params.push(st, st === 1 ? '已发布' : '待发布')
    }
    params.push(req.params.id)

    db.prepare(`UPDATE knowledge_article SET ${sets.join(', ')} WHERE id = ?`).run(...params)
    res.json(ok(null))
  } catch (e) {
    res.json(fail(e.message))
  }
})

// 更新状态
router.put('/knowledge/article/:id/status', auth, (req, res) => {
  try {
    const st = Number(req.body.status)
    const stText = st === 1 ? '已发布' : '待发布'
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    db.prepare('UPDATE knowledge_article SET status = ?, statusText = ?, updatedAt = ? WHERE id = ?').run(st, stText, now, req.params.id)
    res.json(ok(null))
  } catch (e) {
    res.json(fail(e.message))
  }
})

// 删除文章
router.delete('/knowledge/article/:id', auth, (req, res) => {
  try {
    db.prepare('DELETE FROM knowledge_article WHERE id = ?').run(req.params.id)
    res.json(ok(null))
  } catch (e) {
    res.json(fail(e.message))
  }
})

export default router
