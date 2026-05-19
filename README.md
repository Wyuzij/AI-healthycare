# 心灵AI助手

Vue 3 + Express + SQLite 全栈心理辅导平台，集成 GLM-4 Flash AI 对话。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + Vite + Element Plus + ECharts + Pinia |
| 后端 | Express + better-sqlite3 + JWT + SSE |
| AI | 智谱 GLM-4 Flash（OpenAI 兼容接口） |
| 部署 | 阿里云 ECS + 宝塔面板 + Nginx + PM2 |

## 项目结构

```
ai-vue/
├── src/                    # 前端 Vue 源码
│   ├── api/                # API 接口（admin / frontend）
│   ├── components/         # 公共组件
│   ├── router/             # 路由 + 权限守卫
│   ├── untils/             # axios 封装、请求拦截
│   └── views/              # 页面（仪表盘/知识库/咨询/情绪日记/登录）
├── server/                 # 后端 Express 源码
│   ├── routes/             # 路由（user/chat/emotion/knowledge/upload/analytics）
│   ├── middleware/         # JWT 鉴权中间件
│   ├── db.js               # SQLite 建表 + 迁移
│   ├── seed.js             # Mock 数据填充
│   ├── swagger.js          # OpenAPI 3.0 文档
│   └── index.js            # 入口（生产环境 serve 前端 dist）
├── dist/                   # 前端构建产物（生产用）
└── vite.config.js          # Vite 配置（dev proxy）
```

## 后端实现

Express + better-sqlite3 本地数据库，JWT 鉴权，SSE 流式 AI 对话。

**数据库 6 张表：** user / chat_session / chat_message / emotion_diary / knowledge_category / knowledge_article

**20 个接口：**

| 模块 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 用户 | POST | /api/user/login | 登录，bcrypt 验密，签发 7 天 JWT |
| | POST | /api/user/add | 注册 |
| | POST | /api/user/logout | 登出 |
| AI 对话 | POST | /api/psychological-chat/session/start | 创建会话 |
| | POST | /api/psychological-chat/stream | SSE 流式回复（GLM-4 Flash） |
| | GET | /api/psychological-chat/sessions | 会话列表（分页） |
| | GET | /api/psychological-chat/sessions/:id/messages | 历史消息 |
| | GET | /api/psychological-chat/session/:id/emotion | AI 情绪分析 |
| | DELETE | /api/psychological-chat/sessions/:id | 删除会话 |
| 情绪日记 | POST | /api/emotion-diary | 添加日记 |
| | GET | /api/emotion-diary/admin/page | 管理端分页 |
| | DELETE | /api/emotion-diary/admin/:id | 删除 |
| 知识库 | GET | /api/knowledge/category/tree | 分类列表（扁平） |
| | GET | /api/knowledge/article/page | 文章分页 |
| | GET | /api/knowledge/article/:id | 文章详情 |
| | POST | /api/knowledge/article | 创建文章 |
| | PUT | /api/knowledge/article/:id | 更新文章 |
| | PUT | /api/knowledge/article/:id/status | 状态变更 |
| | DELETE | /api/knowledge/article/:id | 删除文章 |
| 其他 | POST | /api/file/upload | 图片上传（multer） |
| | GET | /api/data-analytics/overview | 仪表盘统计 + 7 天趋势 |
| | GET | /api-docs | Swagger UI |

**响应格式：** `{ code, msg, data, message, success }`
**分页格式：** `{ records, total, size, current, pages }`
**鉴权：** 请求头 `token`（JWT payload：`{ userId, username, roleType }`）

## 快速开始

### 前端 dev

```bash
npm install
npm run dev        # http://localhost:5173
```

### 后端 dev

```bash
cd server
cp .env.example .env    # 编辑 .env 填入 GLM_API_KEY
npm install
node seed.js             # 初始化数据
npm run dev              # http://localhost:3000
```

### .env 配置

```
PORT=3000
JWT_SECRET=随便一串随机字符
GLM_API_KEY=你的智谱API密钥
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
GLM_MODEL=glm-4-flash
```

### 测试账号

| 角色 | 用户名 | 密码 |
|---|---|---|
| 管理员 | admin | admin123 |
| 普通用户 | zhangsan | 123456 |

## 跨域处理

生产环境前后端同域名同端口，Nginx 按路径分发——`/` 走前端静态文件，`/api/*` 反向代理到 Express。浏览器始终只看到一个源，无跨域问题。

开发环境 Vite proxy 同理：

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': { target: 'http://localhost:3000', changeOrigin: true }
  }
}
```

## 部署（阿里云 ECS + 宝塔面板）

**环境：** CentOS / Alibaba Cloud Linux + Node 22

```bash
# 1. 安装 Node 22
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs

# 2. 编译工具
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y python38

# 3. 拉代码
cd /www/wwwroot
git clone https://github.com/Wyuzij/AI-healthycare.git
cd AI-healthycare/server

# 4. 创建 .env 并填入实际值
cat > .env << 'EOF'
PORT=3000
JWT_SECRET=实际随机字符串
GLM_API_KEY=实际key
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
GLM_MODEL=glm-4-flash
EOF

# 5. 安装 + 初始化
npm install
node seed.js

# 6. PM2 守护
npm install -g pm2
NODE_ENV=production pm2 start index.js --name ai-healthycare
pm2 startup
pm2 save
```

**宝塔面板：**
- 网站 → 添加站点（填域名或 IP） → 反向代理目标 `http://127.0.0.1:3000`
- SSL → 申请免费证书

**更新前端：** 本地 `npm run build`，上传 `dist/` 覆盖 `/www/wwwroot/dist/`。
**更新后端：** 拉代码后 `pm2 restart ai-healthycare`。

**数据备份：** 下载 `/www/wwwroot/server/data.db` 即可，SQLite 单文件。

## Swagger 文档

开发环境访问 `http://localhost:3000/api-docs`，生产环境 `https://你的域名/api-docs`。
