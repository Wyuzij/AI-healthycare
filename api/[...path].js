export const config = { maxDuration: 10 }

export default async function handler(req, res) {
  const pathSegments = req.query.path || []
  const backendBase = 'http://159.75.169.224:1235'

  const backendPath = '/' + pathSegments.join('/')
  const url = new URL(backendPath, backendBase)

  // 透传查询参数
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path') {
      url.searchParams.append(key, value)
    }
  })

  const headers = {}
  // 透传关键请求头
  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type']
  }
  if (req.headers['token']) {
    headers['token'] = req.headers['token']
  }
  if (req.headers['authorization']) {
    headers['Authorization'] = req.headers['authorization']
  }

  const fetchOptions = {
    method: req.method,
    headers,
  }

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  }

  try {
    const backendRes = await fetch(url.toString(), fetchOptions)
    const contentType = backendRes.headers.get('content-type') || ''
    let data = null

    if (contentType.includes('application/json')) {
      data = await backendRes.json()
    } else {
      data = await backendRes.text()
    }

    res.status(backendRes.status)
    if (contentType.includes('application/json')) {
      res.json(data)
    } else {
      res.send(data)
    }
  } catch (error) {
    console.error('代理请求失败:', error.message)
    res.status(502).json({ code: -1, msg: '后端服务不可达' })
  }
}
