import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

import express from 'express'
import cors from 'cors'
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

app.use(cors())
app.use(express.json())

// API 文档页
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: '心灵AI助手 API 文档'
}))
// 文档 JSON（方便导入 Apifox/Postman）
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec))

// 静态文件：上传的图片通过 /files 访问
app.use('/files', express.static(join(__dirname, 'public', 'uploads')))

// API 路由
app.use('/api', userRouter)
app.use('/api', chatRouter)
app.use('/api', emotionRouter)
app.use('/api', knowledgeRouter)
app.use('/api', uploadRouter)
app.use('/api', analyticsRouter)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
  console.log(`API Docs  at http://localhost:${PORT}/api-docs`)
})
