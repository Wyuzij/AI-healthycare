<template>
  <div class="article-page">
    <div class="article-body">
      <div class="info-card glass-card">
        <div class="info-top">
          <el-tag round size="large" effect="light">{{ articleDetail.categoryName }}</el-tag>
          <span class="info-date">
            <el-icon><Clock /></el-icon>
            {{ dayjs(articleDetail.updatedAt).format('YYYY-MM-DD') }}
          </span>
        </div>

        <h1 class="article-title">{{ articleDetail.title }}</h1>

        <div class="summary-box" v-if="articleDetail.summary">
          <p>{{ articleDetail.summary }}</p>
        </div>

        <div class="info-bottom">
          <span><el-icon><User /></el-icon>{{ articleDetail.authorName }}</span>
          <span><el-icon><View /></el-icon>{{ articleDetail.readCount }} 次阅读</span>
        </div>
      </div>

      <div class="content-card glass-card">
        <h2 class="content-label">正文内容</h2>
        <div class="article-content" v-html="formatContent(articleDetail.content)"></div>

        <div class="tags-section" v-if="articleDetail.tagArray && articleDetail.tagArray.length">
          <h4>相关标签</h4>
          <div class="tags-list">
            <el-tag v-for="tag in articleDetail.tagArray" :key="tag" round effect="light" class="tag-item">{{ tag }}</el-tag>
          </div>
        </div>
      </div>

      <div class="empty-state" v-if="!articleDetail.title">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <p>文章加载中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getKnowledgeDetail } from '../api/frontend'
import { dayjs } from 'element-plus'
import { Clock, User, View } from '@element-plus/icons-vue'

const props = defineProps({ id: String })
const articleDetail = ref({})

const formatContent = (content) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
}

onMounted(() => {
  getKnowledgeDetail(props.id).then(data => { articleDetail.value = data })
})
</script>

<style lang="scss" scoped>
.article-page {
  min-height: calc(100vh - 120px);
  background: var(--bg-root);
}

.article-body {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  padding: 32px;
  animation: fadeUp .5s var(--ease-out);
}

.info-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.info-date {
  font-size: 13px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-title {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 16px;
  letter-spacing: -0.01em;
}

.summary-box {
  background: var(--bg-muted);
  border-left: 4px solid var(--sage-400);
  padding: 16px 20px;
  border-radius: 0 var(--r-sm) var(--r-sm) 0;
  margin-bottom: 20px;
  p { font-size: 15px; color: var(--text-secondary); line-height: 1.7; }
}

.info-bottom {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: var(--text-muted);
  span { display: flex; align-items: center; gap: 5px; }
}

.content-card {
  padding: 32px;
  animation: fadeUp .5s var(--ease-out) .1s both;
}

.content-label {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-default);
}

.article-content {
  font-size: 16px;
  line-height: 1.85;
  color: var(--text-primary);

  :deep(p) { margin-bottom: 14px; }
  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    margin: 24px 0 12px;
    color: var(--text-primary);
  }
  :deep(h2) { font-size: 22px; padding-bottom: 8px; border-bottom: 2px solid var(--border-default); }
  :deep(h3) { font-size: 18px; }
  :deep(strong) { color: var(--brand-500); }
  :deep(blockquote) {
    border-left: 3px solid var(--sage-400);
    padding: 12px 18px;
    margin: 14px 0;
    background: var(--bg-muted);
    border-radius: 0 var(--r-sm) var(--r-sm) 0;
  }
  :deep(ul), :deep(ol) { padding-left: 20px; margin-bottom: 14px; }
  :deep(li) { margin-bottom: 6px; list-style: disc; }
}

.tags-section {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--border-default);
  h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; }
}

.tags-list { display: flex; flex-wrap: wrap; gap: 8px; }

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);
  .empty-icon { color: var(--brand-300); margin-bottom: 16px; display: flex; justify-content: center; }
  p { font-size: 16px; }
}
</style>
