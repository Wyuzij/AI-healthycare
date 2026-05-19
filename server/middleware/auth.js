import jwt from 'jsonwebtoken'

// 必选鉴权：未登录返回 -1
export const auth = (req, res, next) => {
  const token = req.headers.token
  if (!token) {
    return res.json({ code: '-1', msg: '未登录' })
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.json({ code: '-1', msg: '登录过期，请重新登录' })
  }
}

// 可选鉴权：有 token 就解析，没有也放行
export const optionalAuth = (req, res, next) => {
  const token = req.headers.token
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET)
    } catch { /* token 无效也放行 */ }
  }
  next()
}
