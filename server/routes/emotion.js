import { Router } from 'express'
import db from '../db.js'
import { auth } from '../middleware/auth.js'

const router = Router()
const ok = (data, msg = '操作成功') => ({ code: '200', msg, data, message: msg, success: true })
const fail = (msg) => ({ code: '500', msg, success: false })

// 添加情绪日记
router.post('/emotion-diary', auth, (req, res) => {
  try {
    const { diaryDate, moodScore, dominantEmotion, emotionTriggers, diaryContent, sleepQuality, stressLevel } = req.body
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const preview = (diaryContent || '').slice(0, 50)
    const result = db.prepare(`
      INSERT INTO emotion_diary (userId, username, diaryDate, moodScore, dominantEmotion, emotionTriggers, diaryContent, diaryContentPreview, sleepQuality, stressLevel, contentLength, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.userId, req.user.username,
      diaryDate || new Date().toISOString().slice(0, 10),
      moodScore || 5, dominantEmotion || '平静', emotionTriggers || '',
      diaryContent || '', preview, sleepQuality || 5, stressLevel || 3,
      (diaryContent || '').length, now, now
    )
    res.json(ok({ id: result.lastInsertRowid }))
  } catch (e) {
    res.json(fail(e.message))
  }
})

// 管理端分页
router.get('/emotion-diary/admin/page', auth, (req, res) => {
  try {
    const pn = Number(req.query.page) || 1
    const ps = Number(req.query.pageSize) || 10
    const offset = (pn - 1) * ps

    const records = db.prepare(`
      SELECT id, userId, username, diaryDate, moodScore, dominantEmotion, emotionTriggers,
        diaryContent, diaryContentPreview, sleepQuality, stressLevel,
        hasAiEmotionAnalysis, aiAnalysisStatus, contentLength, createdAt, updatedAt
      FROM emotion_diary ORDER BY createdAt DESC LIMIT ? OFFSET ?
    `).all(ps, offset)
    const total = db.prepare('SELECT COUNT(*) as count FROM emotion_diary').get().count
    const pages = Math.ceil(total / ps)

    res.json(ok({ records, total, size: ps, current: pn, pages }))
  } catch (e) {
    res.json(fail(e.message))
  }
})

// 管理端删除
router.delete('/emotion-diary/admin/:id', auth, (req, res) => {
  try {
    db.prepare('DELETE FROM emotion_diary WHERE id = ?').run(req.params.id)
    res.json(ok(null))
  } catch (e) {
    res.json(fail(e.message))
  }
})

export default router
