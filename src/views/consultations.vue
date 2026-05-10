<template>
  <div class="consultations-admin">
    <PageHead title="咨询记录" />

    <div class="table-wrap glass-card">
      <el-table :data="tableData" style="width:100%">
        <el-table-column label="用户" width="80">
          <template #default="scope">
            <el-avatar :size="36" :style="{ background: 'var(--grad-brand)' }">{{ scope.row.userNickname?.charAt(0) || 'U' }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="会话信息" min-width="280">
          <template #default="scope">
            <div class="session-cell">
              <span class="session-name">{{ scope.row.sessionTitle }}</span>
              <span class="session-preview">{{ scope.row.lastMessageContent }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="messageCount" label="消息数" width="90" align="center" />
        <el-table-column prop="lastMessageTime" label="最后消息" width="160" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="scope">
            <el-button type="primary" text @click="viewSessionDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-wrap">
      <el-pagination :page-size="pagination.size" layout="prev, pager, next" :total="pagination.total" @change="handleChange" />
    </div>

    <el-dialog v-model="showDetailDialog" title="咨询会话详情" width="70%" :close-on-click-modal="false">
      <div class="session-detail">
        <div class="detail-header">
          <div class="detail-item"><span class="d-label">用户</span><span class="d-value">{{ sessionDetail.userNickname }}</span></div>
          <div class="detail-item"><span class="d-label">开始时间</span><span class="d-value">{{ sessionDetail.startedAt }}</span></div>
          <div class="detail-item"><span class="d-label">消息数</span><span class="d-value">{{ sessionDetail.messageCount }}</span></div>
        </div>

        <div class="messages-section">
          <h4>对话记录</h4>
          <div class="messages-list" v-loading="loadingMessages">
            <div class="message-item" v-for="item in sessionMessages" :key="item.id" :class="item.senderType === 1 ? 'msg-user' : 'msg-ai'">
              <div class="msg-head">
                <span class="msg-sender">{{ item.senderType === 1 ? '用户' : 'AI助手' }}</span>
                <span class="msg-time">{{ item.createdAt }}</span>
              </div>
              <div class="msg-content">{{ item.content }}</div>
            </div>
            <div v-if="!sessionMessages.length && !loadingMessages" class="empty-msg">暂无对话记录</div>
          </div>
        </div>
      </div>
      <template #footer><el-button @click="showDetailDialog = false">关闭</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import PageHead from '../components/PageHead.vue'
import { getConsultationPage, getSessionDetail } from '../api/admin'

const tableData = ref([])
const pagination = reactive({ total: 0, size: 10, currentPage: 1 })
const sessionDetail = ref({})
const sessionMessages = ref([])
const loadingMessages = ref(false)
const showDetailDialog = ref(false)

const viewSessionDetail = (row) => {
  loadingMessages.value = true
  showDetailDialog.value = true
  sessionDetail.value = row
  getSessionDetail(row.id).then(res => { loadingMessages.value = false; sessionMessages.value = res })
}

const handleChange = (page) => { pagination.currentPage = page; handleSearch() }
const handleSearch = () => { getConsultationPage(pagination).then(res => { tableData.value = res.records; pagination.total = res.total }) }

onMounted(() => { handleSearch() })
</script>

<style lang="scss" scoped>
.consultations-admin {
  .table-wrap { padding: 0; overflow: hidden; }
  .session-cell { display: flex; flex-direction: column; gap: 4px; }
  .session-name { font-weight: 600; color: var(--text-primary); }
  .session-preview { font-size: 13px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .pagination-wrap { display: flex; justify-content: center; padding: 24px 0; }
}

.session-detail {
  .detail-header {
    display: flex; gap: 32px; padding: 16px;
    background: var(--bg-muted); border-radius: var(--r-md); margin-bottom: 20px;
  }
  .detail-item { display: flex; gap: 8px; }
  .d-label { font-weight: 600; color: var(--text-primary); }
  .d-value { color: var(--text-secondary); }
  .messages-section h4 { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; }
  .messages-list {
    max-height: 400px; overflow-y: auto; border: 1px solid var(--border-default);
    border-radius: var(--r-md); padding: 16px; background: var(--bg-surface);
    display: flex; flex-direction: column; gap: 10px;
  }
  .message-item {
    padding: 12px; border-radius: var(--r-md);
    &.msg-user { background: rgba(232,168,124,0.06); border: 1px solid rgba(232,168,124,0.12); }
    &.msg-ai { background: rgba(127,175,139,0.06); border: 1px solid rgba(127,175,139,0.12); }
  }
  .msg-head { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .msg-sender { font-weight: 600; color: var(--text-primary); font-size: 13px; }
  .msg-time { font-size: 11px; color: var(--text-muted); }
  .msg-content { color: var(--text-primary); line-height: 1.6; white-space: pre-wrap; font-size: 14px; }
  .empty-msg { text-align: center; padding: 24px; color: var(--text-muted); }
}
</style>
