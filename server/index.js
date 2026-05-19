import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

import express from 'express'
import cors from 'cors'
import fs from 'fs'
import userRouter from './routes/user.js'
import chatRouter from './routes/chat.js'
import emotionRouter from './routes/emotion.js'
import knowledgeRouter from './routes/knowledge.js'
import uploadRouter from './routes/upload.js'
import analyticsRouter from './routes/analytics.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './swagger.js'

const app = express()
const PORT = process.env.PORT || 3000
const PROD = process.env.NODE_ENV === 'production'

// Render 需要返回实际的监听端口
const BIND_PORT = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT

app.use(cors())
app.use(express.json())

// 健康检查（Render 用）
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: '心灵AI助手 API 文档'
}))
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec))

// 文件
app.use('/files', express.static(join(__dirname, 'public', 'uploads')))

// API 路由
app.use('/api', userRouter)
app.use('/api', chatRouter)
app.use('/api', emotionRouter)
app.use('/api', knowledgeRouter)
app.use('/api', uploadRouter)
app.use('/api', analyticsRouter)

// 前端静态文件
const distDir = join(__dirname, '..', 'dist')
if (PROD && fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  // SPA fallback：非 /api 的路径都返回 index.html
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return
    res.sendFile(join(distDir, 'index.html'))
  })
  console.log('Frontend dist 已启用')
}

app.listen(BIND_PORT, () => {
  console.log(`Server running at http://localhost:${BIND_PORT}`)
})
