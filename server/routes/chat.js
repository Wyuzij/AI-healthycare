import { Router } from 'express'
import OpenAI from 'openai'
import db from '../db.js'
import { auth } from '../middleware/auth.js'

const router = Router()
const ok = (data, msg = '操作成功') => ({ code: '200', msg, data, message: msg, success: true })
const fail = (msg) => ({ code: '500', msg, success: false })

const SYSTEM_PROMPT = `你是心灵树洞，一位专业、温暖且有同理心的心理咨询师。

请始终遵循：
1. 用温和包容的语气交流，营造安全的倾诉环境
2. 积极倾听，适时复述和确认对方的感受
3. 运用认知行为疗法、正念、积极心理学等方法提供指导
4. 避免说教和评判，多用开放式提问引导思考
5. 在适当时候给予鼓励，帮助对方看到自身资源
6. 发现自伤、自杀等危机信号，明确建议寻求线下专业帮助
全程中文，每次回复控制在200字以内，像朋友聊天一样自然。`

function getClient() {
  return new OpenAI({
    apiKey: process.env.GLM_API_KEY,
    baseURL: process.env.GLM_BASE_URL
  })
}

function getHistory(sessionId) {
  return db.prepare(
    'SELECT role, content FROM chat_message WHERE sessionId = ? ORDER BY createdAt ASC'
  ).all(sessionId)
}

function cleanId(raw) {
  return String(raw).replace(/^session_/, '')
}

// 创建会话
router.post('/psychological-chat/session/start', auth, (req, res) => {
  try {
    const { initialMessage, sessionTitle } = req.body
    if (!initialMessage) return res.json(fail('消息不能为空'))
    const title = sessionTitle || `心灵AI对话 - ${new Date().toLocaleString('zh-CN', { hour12: false })}`
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const result = db.prepare(
      'INSERT INTO chat_session (userId, sessionTitle, startedAt, updatedAt, lastMessageContent, lastMessageTime) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user.userId, title, now, now, initialMessage, now)
    db.prepare('INSERT INTO chat_message (sessionId, role, senderType, content, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run(result.lastInsertRowid, 'user', 1, initialMessage, now)
    res.json(ok({ sessionId: result.lastInsertRowid, status: 'ACTIVE' }))
  } catch (e) {
    res.json(fail(e.message))
  }
})

// SSE 流式对话
router.post('/psychological-chat/stream', auth, async (req, res) => {
  const { sessionId, userMessage } = req.body
  const sid = Number(cleanId(sessionId))
  if (!sid || !userMessage) return res.json(fail('会话ID或消息不能为空'))

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  db.prepare('INSERT INTO chat_message (sessionId, role, senderType, content, createdAt) VALUES (?, ?, ?, ?, ?)')
    .run(sid, 'user', 1, userMessage, now)
  db.prepare('UPDATE chat_session SET updatedAt = ?, lastMessageContent = ?, lastMessageTime = ? WHERE id = ?')
    .run(now, userMessage, now, sid)

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  try {
    const history = getHistory(sid)
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(m => ({ role: m.role, content: m.content }))
    ]

    const stream = await getClient().chat.completions.create({
      model: process.env.GLM_MODEL || 'glm-4-flash',
      messages,
      max_tokens: 500,
      stream: true
    })

    let fullContent = ''
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        fullContent += content
        res.write(`data: ${JSON.stringify({ code: '200', data: { content } })}\n\n`)
      }
    }

    const endTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
    db.prepare('INSERT INTO chat_message (sessionId, role, senderType, content, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run(sid, 'assistant', 2, fullContent, endTime)
    // 计算时长
    db.prepare(`
      UPDATE chat_session SET updatedAt = ?, lastMessageContent = ?, lastMessageTime = ?,
        durationMinutes = CAST(ROUND((julianday(?) - julianday(startedAt)) * 1440) AS INTEGER)
      WHERE id = ?
    `).run(endTime, fullContent, endTime, endTime, sid)

    res.write('event: done\ndata: {}\n\n')
    res.end()
  } catch (e) {
    console.error('SSE stream error:', e)
    res.write(`data: ${JSON.stringify({ code: '500', message: 'AI服务暂时不可用' })}\n\n`)
    res.write('event: done\ndata: {}\n\n')
    res.end()
  }
})

// 会话列表
router.get('/psychological-chat/sessions', auth, (req, res) => {
  try {
    const pn = Number(req.query.pageNum) || Number(req.query.page) || 1
    const ps = Number(req.query.pageSize) || 10
    const offset = (pn - 1) * ps

    let records, total
    if (req.user.roleType === 2) {
      records = db.prepare(`
        SELECT s.id, s.userId, u.nickname as userNickname, s.sessionTitle, s.startedAt,
          s.durationMinutes, s.lastMessageContent, s.lastMessageTime,
          (SELECT COUNT(*) FROM chat_message WHERE sessionId = s.id) as messageCount
        FROM chat_session s LEFT JOIN user u ON s.userId = u.id
        ORDER BY s.updatedAt DESC LIMIT ? OFFSET ?
      `).all(ps, offset)
      total = db.prepare('SELECT COUNT(*) as count FROM chat_session').get().count
    } else {
      records = db.prepare(`
        SELECT s.id, s.userId, u.nickname as userNickname, s.sessionTitle, s.startedAt,
          s.durationMinutes, s.lastMessageContent, s.lastMessageTime,
          (SELECT COUNT(*) FROM chat_message WHERE sessionId = s.id) as messageCount
        FROM chat_session s LEFT JOIN user u ON s.userId = u.id
        WHERE s.userId = ?
        ORDER BY s.updatedAt DESC LIMIT ? OFFSET ?
      `).all(req.user.userId, ps, offset)
      total = db.prepare('SELECT COUNT(*) as count FROM chat_session WHERE userId = ?').get(req.user.userId).count
    }
    const pages = Math.ceil(total / ps)

    res.json(ok({ records, total, size: ps, current: pn, pages }))
  } catch (e) {
    res.json(fail(e.message))
  }
})

// 删除会话
router.delete('/psychological-chat/sessions/:id', auth, (req, res) => {
  try {
    const session = db.prepare('SELECT * FROM chat_session WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId)
    if (!session) return res.json(fail('会话不存在'))
    db.prepare('DELETE FROM chat_session WHERE id = ?').run(req.params.id)
    res.json(ok(null))
  } catch (e) {
    res.json(fail(e.message))
  }
})

// 消息列表
router.get('/psychological-chat/sessions/:id/messages', auth, (req, res) => {
  try {
    const messages = db.prepare(`
      SELECT id, sessionId, role, senderType, content, createdAt
      FROM chat_message WHERE sessionId = ? ORDER BY createdAt ASC
    `).all(req.params.id)
    res.json(ok(messages))
  } catch (e) {
    res.json(fail(e.message))
  }
})

// 情绪分析
router.get('/psychological-chat/session/:id/emotion', auth, async (req, res) => {
  try {
    const sid = Number(cleanId(req.params.id))
    const messages = db.prepare(
      'SELECT role, content FROM chat_message WHERE sessionId = ? ORDER BY createdAt ASC'
    ).all(sid)

    if (messages.length === 0) {
      return res.json(ok({ primaryEmotion: '中性', emotionScore: 50, isNegative: false, riskLevel: 0, suggestion: '暂无对话', improvementSuggestions: [] }))
    }

    const conversation = messages
      .map(m => `${m.role === 'user' ? '来访者' : '咨询师'}: ${m.content}`)
      .join('\n')

    const completion = await getClient().chat.completions.create({
      model: process.env.GLM_MODEL || 'glm-4-flash',
      messages: [
        {
          role: 'system',
          content: '你是情绪分析专家。分析以下心理咨询对话，输出纯JSON（不含```标记，不要换行）：{"primaryEmotion":"主要情绪","emotionScore":0-100,"isNegative":true/false,"riskLevel":0-3,"suggestion":"给用户的小建议，50字内","improvementSuggestions":["建议1","建议2","建议3"]}。riskLevel 0正常1关注2预警3危机。'
        },
        { role: 'user', content: conversation }
      ],
      max_tokens: 400
    })

    const text = completion.choices[0]?.message?.content || '{}'
    let analysis
    try {
      analysis = JSON.parse(text.replace(/```json|```/g, '').trim())
    } catch {
      analysis = { primaryEmotion: '中性', emotionScore: 50, isNegative: false, riskLevel: 0, suggestion: text, improvementSuggestions: [] }
    }
    analysis.improvementSuggestions = analysis.improvementSuggestions || []
    res.json(ok(analysis))
  } catch (e) {
    console.error('Emotion analysis error:', e)
    res.json(ok({ primaryEmotion: '中性', emotionScore: 50, isNegative: false, riskLevel: 0, suggestion: '暂时无法分析', improvementSuggestions: [] }))
  }
})

export default router
