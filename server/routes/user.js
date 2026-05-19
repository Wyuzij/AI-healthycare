import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'
import { auth } from '../middleware/auth.js'

const router = Router()
const ok = (data, msg = '操作成功') => ({ code: '200', msg, data, message: msg, success: true })
const fail = (msg) => ({ code: '500', msg, success: false })

// 注册
router.post('/user/add', (req, res) => {
  try {
    const { username, password, nickname, email, phone } = req.body
    if (!username || !password) {
      return res.json(fail('用户名和密码不能为空'))
    }
    const exist = db.prepare('SELECT id FROM user WHERE username = ?').get(username)
    if (exist) return res.json(fail('用户名已存在'))
    const hash = bcrypt.hashSync(password, 10)
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const displayName = nickname || username
    const result = db.prepare(`
      INSERT INTO user (username, password, nickname, email, phone, displayName, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(username, hash, displayName, email || '', phone || '', displayName, now, now)
    res.json(ok({ id: result.lastInsertRowid, username, nickname: displayName }))
  } catch (e) {
    res.json(fail(e.message))
  }
})

// 登录
router.post('/user/login', (req, res) => {
  try {
    const { username, password } = req.body
    const user = db.prepare('SELECT * FROM user WHERE username = ?').get(username)
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.json(fail('用户名或密码错误'))
    }
    const userType = user.role === 'admin' ? 2 : 1
    const token = jwt.sign(
      { userId: user.id, username: user.username, roleType: userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d', issuer: 'mental-health-assistant' }
    )
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email || '',
      nickname: user.nickname || user.username,
      avatar: user.avatar || '',
      phone: user.phone || '',
      gender: user.gender || 0,
      genderDisplayName: user.genderDisplayName || '保密',
      birthday: user.birthday || '',
      userType,
      userTypeDisplayName: userType === 2 ? '管理员' : '普通用户',
      status: user.status || 1,
      statusDisplayName: user.statusDisplayName || '正常',
      displayName: user.displayName || user.nickname || user.username,
      createdAt: user.createdAt || '',
      updatedAt: user.updatedAt || ''
    }
    res.json({
      code: '200',
      msg: '登录成功',
      data: { userInfo, token, roleType: String(userType) },
      message: '登录成功',
      success: true
    })
  } catch (e) {
    res.json(fail(e.message))
  }
})

// 登出
router.post('/user/logout', auth, (_req, res) => {
  res.json(ok(null))
})

export default router
