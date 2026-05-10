<template>
  <div class="consultation-page">
    <div class="chat-layout">
      <!-- 左侧面板 -->
      <aside class="chat-sidebar">
        <div class="ai-card">
          <div class="ai-avatar">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </div>
          <div class="ai-info">
            <h3>心灵AI助手</h3>
            <span class="online-badge"><span class="dot"></span>在线服务中</span>
          </div>
        </div>

        <div class="emotion-garden">
          <div class="garden-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="color: var(--sage-400);"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            情绪花园
          </div>
          <div class="emotion-display">
            <div class="emotion-circle" :class="emotionCircleClass">
              <span class="emotion-name">{{ currentEmotion.primaryEmotion || '中性' }}</span>
              <span class="emotion-score">{{ currentEmotion.emotionScore || 50 }}</span>
            </div>
          </div>
          <div class="emotion-status">
            <span class="status-label">今天感觉</span>
            <span class="status-value" :class="{ negative: currentEmotion.isNegative }">
              {{ currentEmotion.isNegative ? '需要关注' : '很不错' }}
            </span>
          </div>
          <div class="intensity-row">
            <span class="intensity-dots">
              <span v-for="d in 3" :key="d" class="idot" :class="{ active: getIntensityClass(currentEmotion.emotionScore) >= d }"></span>
            </span>
            <span class="intensity-text">{{ getRiskText(currentEmotion.riskLevel) }}</span>
          </div>

          <div class="suggestion-card" v-if="currentEmotion.suggestion">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color: var(--peach-400); flex-shrink: 0;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <div class="sug-content">
              <span class="sug-title">给你的小建议</span>
              <p class="sug-text">{{ currentEmotion.suggestion }}</p>
            </div>
          </div>

          <div class="healing-list" v-if="currentEmotion.improvementSuggestions?.length">
            <span class="healing-title">治愈行动</span>
            <div class="healing-item" v-for="action in currentEmotion.improvementSuggestions" :key="action">{{ action }}</div>
          </div>

          <div class="risk-card" v-if="currentEmotion.isNegative && currentEmotion.riskLevel > 1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="color: var(--peach-500); flex-shrink: 0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div class="risk-content">
              <span class="risk-title">温馨提示</span>
              <p class="risk-text">{{ currentEmotion.riskDescription }}</p>
            </div>
          </div>
        </div>

        <div class="session-panel">
          <h4 class="session-title">会话历史</h4>
          <div class="session-list" v-if="sessionList.length">
            <div v-for="item in sessionList" :key="item.id" class="session-item" @click="handleSessionClick(item)">
              <div class="session-main">
                <span class="session-name">{{ item.sessionTitle }}</span>
                <span class="session-time">{{ item.startedAt }}</span>
                <p class="session-preview">{{ item.lastMessageContent }}</p>
                <div class="session-meta">
                  <span><el-icon><ChatRound /></el-icon>{{ item.messageCount || 0 }}</span>
                  <span><el-icon><Clock /></el-icon>{{ item.durationMinutes || 0 }}分钟</span>
                </div>
              </div>
              <button class="session-del" @click.stop="handleDeleteSession(item.id)" title="删除会话" aria-label="删除会话">
                <el-icon><Delete /></el-icon>
              </button>
            </div>
          </div>
          <div class="empty-sessions" v-else>
            <p>暂无历史会话</p>
          </div>
        </div>
      </aside>

      <!-- 右侧聊天主区域 -->
      <main class="chat-main">
        <div class="chat-header">
          <div class="header-left">
            <div class="header-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <div class="header-info">
              <h2>心灵AI助手</h2>
              <p>您贴心的心理健康伙伴</p>
            </div>
          </div>
          <button class="new-session-btn" @click="createNewFrontendSession" title="新建会话" aria-label="新建会话">
            <el-icon :size="18"><Plus /></el-icon>
          </button>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div class="msg-item ai" v-if="messages.length === 0">
            <div class="msg-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </div>
            <div class="msg-body">
              <div class="msg-bubble"><p>您好，我是心灵助手，您的心理伙伴。很高兴与您互动，今天您想跟我聊些什么？</p></div>
              <span class="msg-time">刚刚</span>
            </div>
          </div>

          <div v-for="msg in messages" :key="msg.id" class="msg-item" :class="msg.senderType === 2 ? 'ai' : 'user'">
            <div class="msg-avatar">
              <svg v-if="msg.senderType === 1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <svg v-if="msg.senderType === 2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>
            </div>
            <div class="msg-body">
              <div class="msg-bubble">
                <div class="typing-indicator" v-if="msg.senderType === 2 && isAiTyping && !msg.content">
                  <span class="tdot"></span><span class="tdot"></span><span class="tdot"></span>
                </div>
                <div v-else-if="msg.isError" class="error-msg"><p>{{ msg.content }}</p></div>
                <MarkdownRenderer v-else-if="msg.senderType === 2 && msg.content" :content="msg.content" :is-ai-message="true" />
                <p v-else-if="msg.content" v-html="formatMessageContent(msg.content)"></p>
              </div>
              <span class="msg-time">{{ msg.senderType === 2 && isAiTyping ? '正在输入...' : msg.createdAt }}</span>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <div class="input-wrapper">
            <el-input v-model="userMessage" placeholder="分享您的想法..." type="textarea" :rows="2" :disabled="isAiTyping" @keydown="handleKeyDown" class="msg-input" />
            <div class="input-meta">
              <span>Enter 发送 · Shift+Enter 换行</span>
              <span>{{ userMessage.length }}/500</span>
            </div>
          </div>
          <button class="send-btn" @click="sendMessage" :disabled="!userMessage.trim() || userMessage.length > 500 || isAiTyping" aria-label="发送消息">
            <el-icon :size="20"><Promotion /></el-icon>
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { startSession } from '../api/frontend'
import { ElMessage } from 'element-plus'
import { getSessionList, deleteSession, getSessionDetail, getSessionEmotion } from '../api/frontend'
import { Clock, ChatRound, Delete, Plus, Promotion } from '@element-plus/icons-vue'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'

const messagesContainer = ref(null)

const createNewFrontendSession = () => {
  messages.value = []
  userMessage.value = ''
  currentSession.value = { sessionId: `temp_${Date.now()}`, status: 'TEMP', sessionTitle: '新对话' }
  ElMessage.success('已创建新会话')
}

const currentSession = ref(null)
const sessionList = ref([])
const messages = ref([])
const userMessage = ref('')
const isAiTyping = ref(false)

const currentEmotion = ref({ primaryEmotion: '中性', emotionScore: 50, isNegative: false, riskLevel: 0, suggestion: '情绪状态平稳', improvementSuggestions: [] })

const emotionCircleClass = computed(() => {
  const s = currentEmotion.value.emotionScore
  if (s >= 70) return 'positive'
  if (s >= 40) return 'neutral'
  return 'negative'
})

const loadSessionEmotion = (sessionId) => {
  const id = sessionId.toString().startsWith('session_') ? sessionId : `session_${sessionId}`
  getSessionEmotion(id).then(res => { currentEmotion.value = res })
}

const getIntensityClass = (score) => {
  if (score >= 61) return 3
  if (score >= 31) return 2
  return 1
}

const getRiskText = (level) => {
  const map = { 0: '正常', 1: '关注', 2: '预警', 3: '危机' }
  return map[level] || '正常'
}

const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
}

const sendMessage = () => {
  if (!userMessage.value.trim()) return
  if (isAiTyping.value) { ElMessage.error('AI正在回复中,请稍后再发送'); return }
  const message = userMessage.value.trim()
  userMessage.value = ''
  if (!currentSession.value || currentSession.value.status === 'TEMP') { startNewSession(message) }
  else {
    messages.value.push({ id: Date.now(), senderType: 1, content: message, createdAt: new Date().toISOString() })
    startAiResponse(currentSession.value.sessionId, message)
  }
}

const startNewSession = (message) => {
  const params = { initialMessage: message }
  params.sessionTitle = currentSession.value.sessionTitle === '新对话' ? `心灵对话 - ${new Date().toLocaleString('zh-CN', { hour12: false })}` : currentSession.value.sessionTitle
  startSession(params).then(res => {
    const data = { sessionId: res.sessionId, status: res.status, sessionTitle: params.sessionTitle }
    if (currentSession.value && currentSession.value.status === 'TEMP') Object.assign(currentSession.value, data)
    else currentSession.value = data
    getSessionPage()
    messages.value.push({ id: Date.now(), senderType: 1, content: message, createdAt: new Date().toISOString() })
    startAiResponse(currentSession.value.sessionId, message)
  })
}

const startAiResponse = (sessionId, userMessage) => {
  if (isAiTyping.value) { ElMessage.error('AI正在回复中,请稍后再发送'); return }
  isAiTyping.value = true
  const aiMessage = { id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, senderType: 2, content: '', createdAt: new Date().toISOString() }
  messages.value.push(aiMessage)

  const ctrl = new AbortController()
  fetchEventSource(`/api/psychological-chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Token': localStorage.getItem('token'), 'Accept': 'text/event-stream' },
    body: JSON.stringify({ sessionId, userMessage }),
    signal: ctrl.signal,
    onopen: (res) => {
      if (res.headers.get('Content-Type') !== 'text/event-stream') ElMessage.error('返回的不是事件流格式')
    },
    onmessage: (event) => {
      const raw = event.data.trim()
      if (!raw) return
      const aiMsg = messages.value[messages.value.length - 1]
      if (event.event === 'done') { isAiTyping.value = false; ctrl.abort(); loadSessionEmotion(currentSession.value.sessionId); return }
      const payload = JSON.parse(raw)
      const ok = String(payload.code) === '200'
      if (ok && payload.data && payload.data.content) aiMsg.content += payload.data.content
      else if (!ok) handleError(payload.message || 'AI回复错误')
    },
    onerror: (error) => { handleError(error); throw error },
    onclose: () => { loadSessionEmotion(currentSession.value.sessionId) },
  })
}

const handleError = (error) => {
  const aiMsg = messages.value[messages.value.length - 1]
  if (aiMsg) aiMsg.content = 'AI 回复错误,请重试'
  isAiTyping.value = false
  ElMessage.error('AI 回复错误,请重试')
}

const getSessionPage = () => { getSessionList({ pageNum: 1, pageSize: 10 }).then(res => { sessionList.value = res.records || [] }) }

const handleSessionClick = (session) => {
  getSessionDetail(session.id).then(res => { messages.value = res })
  loadSessionEmotion(session.id)
  currentSession.value = { sessionId: 'session_' + session.id, status: 'ACTIVE', sessionTitle: session.sessionTitle }
}

const handleDeleteSession = (sessionId) => { deleteSession(sessionId).then(() => { ElMessage.success('删除成功'); getSessionPage() }) }

const formatMessageContent = (content) => content.replace(/\n/g, '<br/>')

onMounted(() => { getSessionPage(); createNewFrontendSession() })
</script>

<style lang="scss" scoped>
.consultation-page {
  height: calc(100vh - 60px);
  background: var(--bg-root);
}

.chat-layout {
  display: flex;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* === 左侧面板 === */
.chat-sidebar {
  width: 320px;
  background: var(--bg-glass);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-right: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}

.ai-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border-bottom: 1px solid var(--border-default);
}

.ai-avatar {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: var(--grad-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: breathe 4s ease-in-out infinite;
  box-shadow: var(--shadow-brand);
}

.ai-info h3 { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); }

.online-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--sage-500);
  font-weight: 600;
  margin-top: 4px;
  .dot { width: 7px; height: 7px; background: var(--sage-500); border-radius: 50%; animation: pulse 2s infinite; }
}

.emotion-garden {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-muted);
}

.garden-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.emotion-display { display: flex; justify-content: center; margin-bottom: 16px; }

.emotion-circle {
  width: 72px; height: 72px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  box-shadow: var(--shadow-md);
  &.positive { background: linear-gradient(135deg, var(--sage-400), var(--sage-500)); }
  &.neutral { background: linear-gradient(135deg, var(--peach-400), var(--peach-500)); }
  &.negative { background: linear-gradient(135deg, #E0A090, #D4856B); }
}

.emotion-name { font-size: 14px; }
.emotion-score { font-size: 18px; }

.emotion-status { text-align: center; margin-bottom: 12px; font-size: 14px; }
.status-label { color: var(--text-muted); }
.status-value { font-weight: 600; color: var(--sage-500); &.negative { color: var(--peach-500); } }

.intensity-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px; }
.intensity-dots { display: flex; gap: 5px; }
.idot { width: 8px; height: 8px; border-radius: 50%; background: var(--border-strong); &.active { background: var(--brand-400); box-shadow: var(--shadow-brand); } }
.intensity-text { font-size: 12px; color: var(--text-muted); font-weight: 500; }

.suggestion-card {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: var(--bg-glass);
  border-radius: var(--r-md);
  margin-bottom: 12px;
  border: 1px solid var(--border-default);
}
.sug-title { font-weight: 600; color: var(--text-primary); font-size: 13px; display: block; margin-bottom: 4px; }
.sug-text { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

.healing-list { margin-bottom: 12px; }
.healing-title { font-size: 13px; font-weight: 600; color: var(--text-primary); display: block; margin-bottom: 8px; }
.healing-item {
  padding: 10px 12px;
  background: var(--bg-glass);
  border-radius: var(--r-sm);
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  border: 1px solid var(--border-default);
}

.risk-card {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: var(--peach-50);
  border-radius: var(--r-md);
  border: 1px solid var(--peach-100);
}
[data-theme="dark"] .risk-card { background: rgba(232,168,124,0.08); border-color: rgba(232,168,124,0.15); }
.risk-title { font-weight: 600; color: var(--peach-500); font-size: 13px; display: block; margin-bottom: 4px; }
.risk-text { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

.session-panel { flex: 1; padding: 16px 20px; overflow: hidden; display: flex; flex-direction: column; }
.session-title { font-family: var(--font-display); font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; }
.session-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }

.session-item {
  padding: 12px;
  border-radius: var(--r-md);
  cursor: pointer;
  transition: all var(--dur-base);
  border: 1px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  &:hover { background: var(--bg-muted); border-color: var(--border-default); }
}
.session-main { flex: 1; overflow: hidden; }
.session-name { font-weight: 600; font-size: 13px; color: var(--text-primary); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.session-time { font-size: 11px; color: var(--text-muted); }
.session-preview { font-size: 12px; color: var(--text-secondary); margin: 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.session-meta { display: flex; gap: 12px; font-size: 11px; color: var(--text-muted); span { display: flex; align-items: center; gap: 4px; } }
.session-del {
  border: none; background: transparent; cursor: pointer; color: var(--text-muted);
  padding: 4px; border-radius: var(--r-sm); transition: all var(--dur-base); flex-shrink: 0;
  min-width: 32px; min-height: 32px; display: flex; align-items: center; justify-content: center;
  &:hover { color: var(--peach-500); background: rgba(232,168,124,0.1); }
}

.empty-sessions { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 13px; }

/* === 聊天主区域 === */
.chat-main { flex: 1; display: flex; flex-direction: column; background: var(--bg-root); min-width: 0; }

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 14px; }
.header-avatar {
  width: 44px; height: 44px;
  background: var(--grad-brand);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-brand);
}
.header-info h2 { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.header-info p { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
.new-session-btn {
  width: 42px; height: 42px;
  border-radius: var(--r-md);
  border: 1px solid var(--border-default);
  background: var(--bg-glass);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--dur-base);
  &:hover { border-color: var(--brand-400); color: var(--brand-500); background: var(--brand-50); }
  &:focus-visible { outline: 2px solid var(--brand-400); outline-offset: 2px; }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: linear-gradient(180deg, var(--bg-root), var(--bg-surface));
}
.msg-item { display: flex; gap: 12px; animation: fadeUp .3s var(--ease-out); &.user { flex-direction: row-reverse; } }
.msg-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ai .msg-avatar { background: var(--grad-brand); box-shadow: var(--shadow-brand); }
.user .msg-avatar { background: linear-gradient(135deg, var(--text-secondary), var(--text-muted)); }
.msg-body { max-width: 72%; }
.msg-bubble {
  padding: 14px 18px;
  border-radius: var(--r-lg);
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  font-size: 15px;
  line-height: 1.65;
  color: var(--text-primary);
  .user & { background: var(--grad-brand); color: #fff; border: none; box-shadow: var(--shadow-brand); }
}
.msg-time { font-size: 11px; color: var(--text-muted); margin-top: 4px; display: block; }
.user .msg-time { text-align: right; }

.typing-indicator { display: flex; gap: 5px; padding: 6px 0; }
.tdot { width: 8px; height: 8px; background: var(--brand-300); border-radius: 50%; animation: pulse 1.4s ease-in-out infinite;
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
}

.error-msg {
  background: var(--peach-50); border: 1px solid var(--peach-300);
  border-radius: var(--r-sm); padding: 12px 16px; color: var(--peach-500); font-weight: 500;
}

/* 输入区 */
.chat-input {
  padding: 16px 24px;
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-default);
  flex-shrink: 0;
}
.input-wrapper { flex: 1; }
.input-meta { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 6px; }
.send-btn {
  width: 48px; height: 48px;
  border: none;
  border-radius: var(--r-md);
  background: var(--grad-brand);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-brand);
  transition: all var(--dur-base);
  &:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 6px 24px var(--brand-glow); }
  &:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
  &:focus-visible { outline: 2px solid var(--brand-400); outline-offset: 2px; }
}

:deep(.msg-input .el-textarea__inner) {
  background: var(--bg-surface); border: 1px solid var(--border-default);
  border-radius: var(--r-md); resize: none; font-size: 15px; color: var(--text-primary);
  &:focus { border-color: var(--brand-400); box-shadow: 0 0 0 3px var(--brand-glow); }
}
</style>
