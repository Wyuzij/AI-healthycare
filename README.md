# 🧠 AI 心理健康助手

> 基于 Vue 3 + Express + GLM-4 Flash 的全栈心理辅导平台

在线体验：**http://47.100.2.176**

---

## ✨ 功能

- 📊 **数据分析仪表盘** — 用户活跃度、情绪趋势、咨询统计，ECharts 可视化
- 💬 **AI 心理咨询** — GLM-4 Flash 驱动，SSE 流式对话，实时情感分析
- 📝 **知识文章管理** — 心理科普文章编辑发布，富文本 + 封面图
- 🎭 **情绪日记** — 情绪记录、睡眠质量、压力指数追踪
- 🔐 **权限管理** — JWT 鉴权，管理员 / 普通用户双角色

## 🛠 技术栈

| 层 | 技术 |
|---|---|
| 🖥 前端 | Vue 3 · Vite · Element Plus · ECharts · Pinia |
| ⚙️ 后端 | Express · better-sqlite3 · JWT · SSE |
| 🤖 AI | 智谱 GLM-4 Flash（OpenAI 兼容协议） |
| 🚀 部署 | 阿里云 ECS · 宝塔面板 · Nginx · PM2 |

## 📁 项目结构

```
ai-vue/
├── src/                    # Vue 前端源码
│   ├── api/                # 接口封装（admin / frontend）
│   ├── components/         # 公共组件
│   ├── router/             # 路由 + 权限守卫
│   ├── untils/             # axios 封装、请求拦截
│   └── views/              # 页面
├── server/                 # Express 后端源码
│   ├── routes/             # 路由模块
│   ├── middleware/         # JWT 鉴权中间件
│   ├── db.js               # 建表 + 迁移
│   ├── seed.js             # Mock 数据填充
│   ├── swagger.js          # OpenAPI 3.0 文档
│   └── index.js            # 入口（生产环境 serve 前端 dist）
├── dist/                   # 前端构建产物
└── vite.config.js
```

## 🚀 快速开始

```bash
# 前端
npm install
npm run dev                 # http://localhost:5173

# 后端
cd server
npm install
cp .env.example .env        # 编辑 .env 填入 GLM_API_KEY
node seed.js                # 初始化数据库 + Mock 数据
npm run dev                 # http://localhost:3000
```

### 🔑 测试账号

| 角色 | 用户名 | 密码 |
|---|---|---|
| 管理员 | admin | admin123 |
| 普通用户 | zhangsan | 123456 |

## 📡 后端接口

**数据库 6 张表：** user · chat_session · chat_message · emotion_diary · knowledge_category · knowledge_article

**20 个接口：**

| 模块 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 🔐 用户 | POST | /api/user/login | 登录，bcrypt 验密，JWT 7 天 |
| | POST | /api/user/add | 注册 |
| | POST | /api/user/logout | 登出 |
| 💬 AI 对话 | POST | /api/psychological-chat/session/start | 创建会话 |
| | POST | /api/psychological-chat/stream | SSE 流式（GLM-4 Flash） |
| | GET | /api/psychological-chat/sessions | 会话列表（分页） |
| | GET | /api/psychological-chat/sessions/:id/messages | 历史消息 |
| | GET | /api/psychological-chat/session/:id/emotion | AI 情绪分析 |
| | DELETE | /api/psychological-chat/sessions/:id | 删除会话 |
| 🎭 情绪日记 | POST | /api/emotion-diary | 添加日记 |
| | GET | /api/emotion-diary/admin/page | 管理端分页 |
| | DELETE | /api/emotion-diary/admin/:id | 删除 |
| 📝 知识库 | GET | /api/knowledge/category/tree | 分类列表 |
| | GET | /api/knowledge/article/page | 文章分页 |
| | GET | /api/knowledge/article/:id | 文章详情 |
| | POST | /api/knowledge/article | 创建文章 |
| | PUT | /api/knowledge/article/:id | 更新文章 |
| | PUT | /api/knowledge/article/:id/status | 上下架 |
| | DELETE | /api/knowledge/article/:id | 删除文章 |
| 📎 其他 | POST | /api/file/upload | 图片上传 |
| | GET | /api/data-analytics/overview | 仪表盘统计 |
| | GET | /api-docs | Swagger 文档 |

**响应格式：** `{ code, msg, data, message, success }`  
**分页格式：** `{ records, total, size, current, pages }`  
**鉴权方式：** 请求头 `token`，JWT payload 为 `{ userId, username, roleType }`

## 🌐 跨域处理

前后端同一域名同一端口，Nginx 按路径分发——`/api/*` 转发给 Express 3000 端口，其余走前端静态文件。浏览器始终只看到一个源，不存在跨域问题。

开发环境 Vite proxy 同理：

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': { target: 'http://localhost:3000', changeOrigin: true }
  }
}
```

## 🚢 部署

**环境：** 阿里云 ECS 2C2G · Alibaba Cloud Linux · Node 22 · 宝塔面板

```bash
# 安装 Node 22
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs

# 编译工具（better-sqlite3 需要）
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y python38

# 拉代码
cd /www/wwwroot
git clone https://github.com/Wyuzij/AI-healthycare.git
cd AI-healthycare/server

# 创建 .env
cat > .env << 'EOF'
PORT=3000
JWT_SECRET=实际随机字符串
GLM_API_KEY=实际key
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
GLM_MODEL=glm-4-flash
EOF

# 安装 + 初始化
npm install
node seed.js

# PM2 守护
npm install -g pm2
NODE_ENV=production pm2 start index.js --name ai-healthycare
pm2 startup && pm2 save
```

**宝塔面板配置：**
- 网站 → 添加站点 → 域名填 `47.100.2.176`
- 反向代理 → 目标 URL `http://127.0.0.1:3000`

**后续更新：**
- 前端：本地 `npm run build` → 覆盖 `/www/wwwroot/dist/`
- 后端：`git pull` → `pm2 restart ai-healthycare`
- 数据备份：下载 `/www/wwwroot/server/data.db`，SQLite 单文件一把梭

## 🧪 API 文档

`http://47.100.2.176/api-docs`

## 📄 许可证

MIT License
