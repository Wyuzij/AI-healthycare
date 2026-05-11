<template>
  <div class="knowledge-page">
    <div class="knowledge-body">
      <aside class="recommend-panel glass-card">
        <h3 class="panel-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color: var(--brand-500);"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          热门推荐
        </h3>
        <div class="recommend-list" v-if="recommendList.length">
          <div v-for="(item, i) in recommendList" :key="item.id" class="recommend-item" :style="{ animationDelay: `${i * 0.05}s` }" @click="goToArticle(item.id)">
            <span class="rec-rank">{{ i + 1 }}</span>
            <div class="rec-info">
              <h4>{{ item.title }}</h4>
              <span class="read-count">{{ item.readCount }} 次阅读</span>
            </div>
          </div>
        </div>
        <div class="empty-recommend" v-else>
          <p>暂无推荐</p>
        </div>
      </aside>

      <main class="article-panel">
        <article v-for="(item, i) in articleList" :key="item.id" class="article-card glass-card" :style="{ animationDelay: `${i * 0.06}s` }" @click="goToArticle(item.id)">
          <div class="article-cover">
            <div class="cover-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <img v-if="getImage(item.coverImage)" :src="getImage(item.coverImage)" alt="" class="cover-img" loading="lazy" />
          </div>
          <div class="article-info">
            <div class="article-header">
              <h3>{{ item.title }}</h3>
              <el-tag round size="small" effect="light" type="primary">{{ item.categoryName }}</el-tag>
            </div>
            <div class="article-meta">
              <span><el-icon><User /></el-icon>{{ item.authorName }}</span>
              <span><el-icon><Clock /></el-icon>{{ dayjs(item.updatedAt).format('YYYY-MM-DD') }}</span>
            </div>
            <div class="article-stats">
              <span><el-icon><View /></el-icon>{{ item.readCount }} 次阅读</span>
            </div>
          </div>
        </article>

        <div class="empty-state" v-if="articleList.length === 0">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <p>暂无文章</p>
        </div>
      </main>
    </div>

    <div class="pagination-wrap" v-if="pagination.total > 0">
      <el-pagination layout="prev, pager, next" :total="pagination.total" :page-size="pagination.pageSize" @change="handleChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getKnowledgeList } from '../api/frontend'
import { dayjs } from 'element-plus'
import { useRouter } from 'vue-router'
import { User, Clock, View } from '@element-plus/icons-vue'

const router = useRouter()
const recommendList = ref([])
const articleList = ref([])
const pagination = ref({ currentPage: 1, pageSize: 10, total: 0 })

const getPageList = () => {
  getKnowledgeList({ sortField: 'publishedAt', sortDirection: 'desc', ...pagination.value }).then(res => {
    articleList.value = res.records
    pagination.value.total = res.total
  })
}

const getImage = (url) => url || null

const handleChange = (page) => {
  pagination.value.currentPage = page
  getPageList()
}

const goToArticle = (id) => router.push(`/knowledge/article/${id}`)

onMounted(() => {
  getPageList()
  getKnowledgeList({ sortField: 'readCount', sortDirection: 'desc', currentPage: 1, size: 5 }).then(res => {
    recommendList.value = res.records
  }).catch(() => {})
})
</script>

<style lang="scss" scoped>
.knowledge-page {
  min-height: calc(100vh - 120px);
  background: var(--bg-root);
}

.knowledge-body {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 24px 0;
  display: flex;
  gap: 24px;
}

.recommend-panel {
  width: 260px;
  flex-shrink: 0;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 80px;
}

.panel-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommend-list { display: flex; flex-direction: column; gap: 8px; }

.recommend-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: all var(--dur-base);
  animation: fadeUp .4s var(--ease-out) both;

  &:hover { background: var(--bg-muted); transform: translateX(4px); }
  &:focus-visible { outline: 2px solid var(--brand-400); outline-offset: 2px; border-radius: var(--r-sm); }
}

.rec-rank {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--brand-400);
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.rec-info {
  flex: 1;
  min-width: 0;
  h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
}

.read-count { font-size: 12px; color: var(--text-muted); margin-top: 4px; display: block; }

.empty-recommend {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 14px;
}

.article-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  cursor: pointer;
  animation: fadeUp .5s var(--ease-out) both;

  &:hover { border-color: var(--brand-300); }
  &:focus-visible { outline: 2px solid var(--brand-400); outline-offset: 2px; }
}

.article-cover {
  width: 200px;
  height: 130px;
  border-radius: var(--r-sm);
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  background: linear-gradient(135deg, var(--sage-100), var(--brand-100));
}

.cover-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sage-400);
}

.cover-img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.article-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  h3 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text-primary); line-height: 1.4; }
}

.article-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
  span { display: flex; align-items: center; gap: 4px; }
}

.article-stats {
  font-size: 13px;
  color: var(--text-muted);
  span { display: flex; align-items: center; gap: 4px; }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);
  svg { margin: 0 auto 16px; color: var(--brand-300); }
  p { font-size: 16px; }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 32px 24px 60px;
}

@media (max-width: 768px) {
  .knowledge-body { flex-direction: column; }
  .recommend-panel { width: 100%; position: static; }
  .article-card { flex-direction: column; }
  .article-cover { width: 100%; height: 180px; }
}
</style>
