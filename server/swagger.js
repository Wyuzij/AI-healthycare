import swaggerJsdoc from 'swagger-jsdoc'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: '心灵AI助手 API',
      version: '1.0.0',
      description: '心理辅导平台后端接口文档',
      contact: { name: '管理员' }
    },
    servers: [
      { url: '/api', description: 'Vite 代理' },
      { url: 'http://localhost:3000/api', description: '后端直连' }
    ],
    tags: [
      { name: '用户认证', description: '注册、登录、登出' },
      { name: 'AI对话', description: 'AI心理辅导对话' },
      { name: '情绪日记', description: '情绪日记管理' },
      { name: '知识文章', description: '心理知识文章' },
      { name: '文件上传', description: '图片/文件上传' },
      { name: '数据统计', description: '仪表盘统计' }
    ],
    components: {
      securitySchemes: {
        token: { type: 'apiKey', in: 'header', name: 'token', description: 'JWT token' }
      },
      schemas: {
        // 通用响应包装
        ApiOk: {
          type: 'object',
          properties: {
            code: { type: 'string', example: '200' },
            msg: { type: 'string', example: '操作成功' },
            message: { type: 'string', example: '操作成功' },
            success: { type: 'boolean', example: true },
            data: { type: 'object' }
          }
        },
        ApiFail: {
          type: 'object',
          properties: {
            code: { type: 'string', example: '500' },
            msg: { type: 'string', example: '错误信息' },
            success: { type: 'boolean', example: false }
          }
        },
        // 分页
        Pagination: {
          type: 'object',
          properties: {
            records: { type: 'array', items: {} },
            total: { type: 'integer', description: '总记录数' },
            size: { type: 'integer', description: '每页条数' },
            current: { type: 'integer', description: '当前页码' },
            pages: { type: 'integer', description: '总页数' }
          }
        },
        // 用户信息（完整）
        UserInfo: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string' },
            nickname: { type: 'string' },
            avatar: { type: 'string' },
            phone: { type: 'string' },
            gender: { type: 'integer', description: '0=保密 1=男 2=女' },
            genderDisplayName: { type: 'string' },
            birthday: { type: 'string' },
            userType: { type: 'integer', description: '1=普通用户 2=管理员' },
            userTypeDisplayName: { type: 'string' },
            status: { type: 'integer', description: '1=正常' },
            statusDisplayName: { type: 'string' },
            displayName: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        },
        LoginData: {
          type: 'object',
          properties: {
            userInfo: { '$ref': '#/components/schemas/UserInfo' },
            token: { type: 'string', description: 'JWT' },
            roleType: { type: 'string', description: '用户角色类型字符串' }
          }
        },
        // 对话会话
        ChatSession: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            userNickname: { type: 'string' },
            sessionTitle: { type: 'string' },
            startedAt: { type: 'string' },
            durationMinutes: { type: 'integer' },
            lastMessageContent: { type: 'string' },
            lastMessageTime: { type: 'string' },
            messageCount: { type: 'integer' }
          }
        },
        // 聊天消息
        ChatMessage: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            sessionId: { type: 'integer' },
            role: { type: 'string', enum: ['user', 'assistant'] },
            senderType: { type: 'integer', description: '1=用户 2=AI' },
            content: { type: 'string' },
            createdAt: { type: 'string' }
          }
        },
        // 情绪分析
        EmotionAnalysis: {
          type: 'object',
          properties: {
            primaryEmotion: { type: 'string' },
            emotionScore: { type: 'integer', description: '0-100' },
            isNegative: { type: 'boolean' },
            riskLevel: { type: 'integer', description: '0=正常 1=关注 2=预警 3=危机' },
            suggestion: { type: 'string' },
            improvementSuggestions: { type: 'array', items: { type: 'string' } }
          }
        },
        // 情绪日记
        EmotionDiary: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            username: { type: 'string' },
            diaryDate: { type: 'string' },
            moodScore: { type: 'integer', description: '1-10' },
            dominantEmotion: { type: 'string', description: '主导情绪' },
            emotionTriggers: { type: 'string', description: '触发因素' },
            diaryContent: { type: 'string' },
            diaryContentPreview: { type: 'string' },
            sleepQuality: { type: 'integer', description: '1-10' },
            stressLevel: { type: 'integer', description: '1-10' },
            hasAiEmotionAnalysis: { type: 'integer', description: '0=未分析' },
            aiAnalysisStatus: { type: 'string', enum: ['PENDING', 'COMPLETED'] },
            contentLength: { type: 'integer' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        },
        // 知识分类（扁平列表项）
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            categoryName: { type: 'string' },
            description: { type: 'string' },
            sortOrder: { type: 'integer' },
            status: { type: 'integer' },
            statusText: { type: 'string' },
            articleCount: { type: 'integer' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        },
        // 知识文章
        Article: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'UUID' },
            categoryId: { type: 'integer' },
            categoryName: { type: 'string' },
            title: { type: 'string' },
            summary: { type: 'string' },
            content: { type: 'string' },
            tags: { type: 'string' },
            authorName: { type: 'string' },
            readCount: { type: 'integer' },
            isFavorited: { type: 'integer' },
            favoriteCount: { type: 'integer' },
            status: { type: 'integer', description: '0=待发布 1=已发布' },
            statusText: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        },
        // 数据总览
        SystemOverview: {
          type: 'object',
          properties: {
            totalUsers: { type: 'integer' },
            activeUsers: { type: 'integer' },
            totalDiaries: { type: 'integer' },
            totalSessions: { type: 'integer' },
            avgMoodScore: { type: 'number' },
            todayNewUsers: { type: 'integer' },
            todayNewDiaries: { type: 'integer' },
            todayNewSessions: { type: 'integer' }
          }
        }
      }
    }
  },
  apis: [join(__dirname, 'routes', '*.js')]
}

const swaggerSpec = swaggerJsdoc(options)

swaggerSpec.paths = {
  // ==================== 用户认证 ====================
  '/user/login': {
    post: {
      tags: ['用户认证'],
      summary: '用户登录',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password'],
              properties: {
                username: { type: 'string', example: 'admin' },
                password: { type: 'string', example: 'admin123' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: '登录成功', content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/ApiOk' }, { properties: { data: { '$ref': '#/components/schemas/LoginData' }, msg: { example: '登录成功' } } }] } } } },
        '500': { description: '用户名或密码错误' }
      }
    }
  },
  '/user/add': {
    post: {
      tags: ['用户认证'],
      summary: '用户注册',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password'],
              properties: {
                username: { type: 'string' },
                password: { type: 'string' },
                nickname: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' }
              }
            }
          }
        }
      },
      responses: { '200': { description: '注册成功' } }
    }
  },
  '/user/logout': {
    post: {
      tags: ['用户认证'],
      summary: '退出登录',
      security: [{ token: [] }],
      responses: { '200': { description: '退出成功' } }
    }
  },

  // ==================== AI 对话 ====================
  '/psychological-chat/session/start': {
    post: {
      tags: ['AI对话'],
      summary: '创建新会话',
      security: [{ token: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['initialMessage'],
              properties: {
                initialMessage: { type: 'string', description: '首条消息' },
                sessionTitle: { type: 'string', description: '会话标题（可选）' }
              }
            }
          }
        }
      },
      responses: { '200': { description: '返回 { sessionId, status: "ACTIVE" }' } }
    }
  },
  '/psychological-chat/stream': {
    post: {
      tags: ['AI对话'],
      summary: '发送消息（SSE流式）',
      description: '发送用户消息，通过 SSE 流式返回 AI 回复。每个 data 行: {code:"200", data:{content}}，结束事件: event: done',
      security: [{ token: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['sessionId', 'userMessage'],
              properties: {
                sessionId: { type: 'integer' },
                userMessage: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'SSE 事件流', content: { 'text/event-stream': {} } }
      }
    }
  },
  '/psychological-chat/sessions': {
    get: {
      tags: ['AI对话'],
      summary: '会话列表（分页）',
      security: [{ token: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } }
      ],
      responses: {
        '200': {
          description: '分页会话列表',
          content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/ApiOk' }, { properties: { data: { '$ref': '#/components/schemas/Pagination' } } }] } } }
        }
      }
    }
  },
  '/psychological-chat/sessions/{sessionId}': {
    delete: {
      tags: ['AI对话'],
      summary: '删除会话',
      security: [{ token: [] }],
      parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: '删除成功' } }
    }
  },
  '/psychological-chat/sessions/{sessionId}/messages': {
    get: {
      tags: ['AI对话'],
      summary: '获取会话消息',
      security: [{ token: [] }],
      parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        '200': {
          description: '消息列表',
          content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/ApiOk' }, { properties: { data: { type: 'array', items: { '$ref': '#/components/schemas/ChatMessage' } } } }] } } }
        }
      }
    }
  },
  '/psychological-chat/session/{sessionId}/emotion': {
    get: {
      tags: ['AI对话'],
      summary: '会话情绪分析',
      description: 'AI分析指定会话的情绪状态（注意路径用单数 session）',
      security: [{ token: [] }],
      parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' }, description: '会话ID（支持 session_ 前缀）' }],
      responses: {
        '200': {
          description: '情绪分析结果',
          content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/ApiOk' }, { properties: { data: { '$ref': '#/components/schemas/EmotionAnalysis' } } }] } } }
        }
      }
    }
  },

  // ==================== 情绪日记 ====================
  '/emotion-diary': {
    post: {
      tags: ['情绪日记'],
      summary: '添加情绪日记',
      security: [{ token: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                diaryDate: { type: 'string', example: '2026-05-19' },
                moodScore: { type: 'integer', description: '1-10' },
                dominantEmotion: { type: 'string', example: '焦虑' },
                emotionTriggers: { type: 'string', description: '触发因素' },
                diaryContent: { type: 'string' },
                sleepQuality: { type: 'integer', description: '1-10' },
                stressLevel: { type: 'integer', description: '1-10' }
              }
            }
          }
        }
      },
      responses: { '200': { description: '创建成功，返回 { id }' } }
    }
  },
  '/emotion-diary/admin/page': {
    get: {
      tags: ['情绪日记'],
      summary: '管理端情绪日记分页',
      security: [{ token: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } }
      ],
      responses: {
        '200': {
          description: '分页日记列表',
          content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/ApiOk' }, { properties: { data: { allOf: [{ '$ref': '#/components/schemas/Pagination' }, { properties: { records: { type: 'array', items: { '$ref': '#/components/schemas/EmotionDiary' } } } }] } } }] } } }
        }
      }
    }
  },
  '/emotion-diary/admin/{id}': {
    delete: {
      tags: ['情绪日记'],
      summary: '管理端删除情绪日记',
      security: [{ token: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: '删除成功' } }
    }
  },

  // ==================== 知识文章 ====================
  '/knowledge/category/tree': {
    get: {
      tags: ['知识文章'],
      summary: '获取知识分类列表（扁平）',
      responses: {
        '200': {
          description: '分类列表',
          content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/ApiOk' }, { properties: { data: { type: 'array', items: { '$ref': '#/components/schemas/Category' } } } }] } } }
        }
      }
    }
  },
  '/knowledge/article/page': {
    get: {
      tags: ['知识文章'],
      summary: '文章分页列表',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'title', in: 'query', schema: { type: 'string' }, description: '标题模糊搜索' },
        { name: 'categoryId', in: 'query', schema: { type: 'integer' }, description: '分类筛选' },
        { name: 'status', in: 'query', schema: { type: 'string' }, description: '状态：0=待发布 1=已发布 all=全部，默认1' }
      ],
      responses: {
        '200': {
          description: '分页文章列表',
          content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/ApiOk' }, { properties: { data: { allOf: [{ '$ref': '#/components/schemas/Pagination' }, { properties: { records: { type: 'array', items: { '$ref': '#/components/schemas/Article' } } } }] } } }] } } }
        }
      }
    }
  },
  '/knowledge/article/{id}': {
    get: {
      tags: ['知识文章'],
      summary: '文章详情',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: '文章UUID' }],
      responses: {
        '200': { description: '文章详情（自动浏览量+1）', content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/ApiOk' }, { properties: { data: { '$ref': '#/components/schemas/Article' } } }] } } } }
      }
    },
    put: {
      tags: ['知识文章'],
      summary: '更新文章',
      security: [{ token: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                summary: { type: 'string' },
                tags: { type: 'string' },
                categoryId: { type: 'integer' },
                categoryName: { type: 'string' },
                status: { type: 'integer', description: '0=待发布 1=已发布' }
              }
            }
          }
        }
      },
      responses: { '200': { description: '更新成功' } }
    },
    delete: {
      tags: ['知识文章'],
      summary: '删除文章',
      security: [{ token: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: '删除成功' } }
    }
  },
  '/knowledge/article': {
    post: {
      tags: ['知识文章'],
      summary: '创建文章',
      security: [{ token: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'content'],
              properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                summary: { type: 'string' },
                tags: { type: 'string' },
                categoryId: { type: 'integer' },
                categoryName: { type: 'string' },
                status: { type: 'integer', description: '0=待发布 1=已发布' }
              }
            }
          }
        }
      },
      responses: { '200': { description: '创建成功，返回 { id }' } }
    }
  },
  '/knowledge/article/{id}/status': {
    put: {
      tags: ['知识文章'],
      summary: '更新文章状态',
      security: [{ token: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['status'],
              properties: { status: { type: 'integer', description: '0=待发布 1=已发布' } }
            }
          }
        }
      },
      responses: { '200': { description: '更新成功' } }
    }
  },

  // ==================== 文件上传 ====================
  '/file/upload': {
    post: {
      tags: ['文件上传'],
      summary: '上传文件',
      security: [{ token: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['file'],
              properties: {
                file: { type: 'string', format: 'binary' },
                businessType: { type: 'string' },
                businessId: { type: 'string' },
                businessField: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: '上传成功，返回 { url }' }
      }
    }
  },

  // ==================== 数据统计 ====================
  '/data-analytics/overview': {
    get: {
      tags: ['数据统计'],
      summary: '获取数据总览',
      security: [{ token: [] }],
      responses: {
        '200': {
          description: '统计数据',
          content: {
            'application/json': {
              schema: {
                allOf: [{ '$ref': '#/components/schemas/ApiOk' }, {
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        systemOverview: { '$ref': '#/components/schemas/SystemOverview' },
                        emotionHeatmap: { type: 'object', properties: { gridData: { type: 'array', items: { type: 'array' } } } }
                      }
                    }
                  }
                }]
              }
            }
          }
        }
      }
    }
  }
}

export default swaggerSpec
