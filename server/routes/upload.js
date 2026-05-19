import { Router } from 'express'
import multer from 'multer'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import fs from 'fs'
import { auth } from '../middleware/auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uploadDir = join(__dirname, '..', 'public', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop()
    cb(null, `${randomUUID()}.${ext}`)
  }
})
const upload = multer({ storage })

const router = Router()
const ok = (data, msg = '操作成功') => ({ code: '200', msg, data, message: msg, success: true })
const fail = (msg) => ({ code: '500', msg, success: false })

router.post('/file/upload', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.json(fail('上传失败'))
    res.json(ok({ filePath: `/files/${req.file.filename}`, url: `/files/${req.file.filename}` }))
  } catch (e) {
    res.json(fail(e.message))
  }
})

export default router
