import { Router } from 'express'
import db from '../db.js'
import { auth } from '../middleware/auth.js'

const router = Router()
const ok = (data, msg = '操作成功') => ({ code: '200', msg, data, message: msg, success: true })
const fail = (msg) => ({ code: '500', msg, success: false })

// 生成最近 N 天的日期列表
function last7days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

// 按日期分组通用查询
function dailyGroup(table, dateCol, agg, extraWhere = '') {
  const rows = db.prepare(`
    SELECT date(${dateCol}) as d, ${agg}
    FROM ${table}
    WHERE date(${dateCol}) >= date('now', '-6 days') ${extraWhere}
    GROUP BY d ORDER BY d
  `).all()
  const map = {}
  rows.forEach(r => { map[r.d] = r.v })
  return last7days().map(date => ({ date, value: map[date] || 0 }))
}

router.get('/data-analytics/overview', auth, (_req, res) => {
  try {
    // 基础统计
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM user').get().count
    const activeUsers = db.prepare("SELECT COUNT(DISTINCT userId) as count FROM chat_session WHERE updatedAt >= datetime('now', '-7 days')").get().count
    const totalDiaries = db.prepare('SELECT COUNT(*) as count FROM emotion_diary').get().count
    const totalSessions = db.prepare('SELECT COUNT(*) as count FROM chat_session').get().count
    const avgMoodScore = db.prepare('SELECT ROUND(AVG(moodScore), 1) as avg FROM emotion_diary').get().avg || 5.0
    const todayNewUsers = db.prepare("SELECT COUNT(*) as count FROM user WHERE date(createdAt) = date('now')").get().count
    const todayNewDiaries = db.prepare("SELECT COUNT(*) as count FROM emotion_diary WHERE date(createdAt) = date('now')").get().count
    const todayNewSessions = db.prepare("SELECT COUNT(*) as count FROM chat_session WHERE date(startedAt) = date('now')").get().count
    const avgDurationMinutes = db.prepare('SELECT ROUND(AVG(durationMinutes), 0) as avg FROM chat_session').get().avg || 0

    // 情绪趋势（最近7天）
    const emotionTrend = last7days().map(date => {
      const row = db.prepare(`
        SELECT ROUND(AVG(moodScore), 1) as avgMoodScore, COUNT(*) as recordCount
        FROM emotion_diary WHERE diaryDate = ?
      `).get(date)
      return { date, avgMoodScore: row.avgMoodScore || 0, recordCount: row.recordCount || 0 }
    })

    // 咨询会话趋势（最近7天）
    const consultationDailyTrend = last7days().map(date => {
      const row = db.prepare(`
        SELECT COUNT(*) as sessionCount, COUNT(DISTINCT userId) as userCount
        FROM chat_session WHERE date(startedAt) = ?
      `).get(date)
      return { date, sessionCount: row.sessionCount || 0, userCount: row.userCount || 0 }
    })

    // 用户活跃趋势（最近7天）
    const userActivity = last7days().map(date => {
      const active = db.prepare("SELECT COUNT(DISTINCT userId) as c FROM chat_session WHERE date(updatedAt) = ?").get(date)
      const newUsers = db.prepare('SELECT COUNT(*) as c FROM user WHERE date(createdAt) = ?').get(date)
      const diary = db.prepare('SELECT COUNT(DISTINCT userId) as c FROM emotion_diary WHERE date(createdAt) = ?').get(date)
      const consultation = db.prepare('SELECT COUNT(DISTINCT userId) as c FROM chat_session WHERE date(startedAt) = ?').get(date)
      return {
        date,
        activeUsers: active.c || 0,
        newUsers: newUsers.c || 0,
        diaryUsers: diary.c || 0,
        consultationUsers: consultation.c || 0
      }
    })

    res.json(ok({
      systemOverview: {
        totalUsers,
        activeUsers,
        totalDiaries,
        totalSessions,
        avgMoodScore,
        todayNewUsers,
        todayNewDiaries,
        todayNewSessions
      },
      emotionTrend,
      consultationStats: {
        totalSessions,
        avgDurationMinutes,
        dailyTrend: consultationDailyTrend
      },
      userActivity,
      emotionHeatmap: {
        gridData: [[]]
      }
    }))
  } catch (e) {
    res.json(fail(e.message))
  }
})

export default router
