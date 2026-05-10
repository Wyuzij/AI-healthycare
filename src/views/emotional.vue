<template>
  <div class="emotional-admin">
    <PageHead title="情绪日志" />

    <TableSearch :formItem="formItem" @search="handleSearch" />

    <div class="table-wrap glass-card">
      <el-table :data="tableData" style="width:100%;">
        <el-table-column label="用户 ID" prop="id" width="80" />
        <el-table-column label="用户" width="80">
          <template #default="scope">
            <el-avatar :size="32" :style="{ background: 'var(--grad-sage)' }">{{ scope.row.nickName?.charAt(0) || 'U'
              }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="记录日期" prop="diaryDate" width="120" />
        <el-table-column label="情绪评分" width="200">
          <template #default="scope">
            <el-rate :model-value="scope.row.moodScore" :max="10" disabled />
          </template>
        </el-table-column>
        <el-table-column label="生活指标" width="110">
          <template #default="scope">
            <div class="life-cell">
              <span>睡 {{ scope.row.sleepQuality }}/5</span>
              <span>压 {{ scope.row.stressLevel }}/5</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="情绪触发因素" prop="emotionalTriggers" min-width="140" show-overflow-tooltip />
        <el-table-column label="日记内容" prop="diaryContent" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <el-button @click="viewDetail(scope.row)" text type="primary" size="small">详情</el-button>
            <el-button @click="handleDelete(scope.row)" text type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-wrap">
      <el-pagination :page-size="pagination.size" layout="prev, pager, next" :total="pagination.total"
        @change="handleChange" />
    </div>

    <el-dialog v-model="dialogVisible" title="情绪日志详情" width="800px" :close-on-click-modal="false">
      <div class="detail-content" v-if="currentDetail">
        <section class="detail-section">
          <h4>用户信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">{{ currentDetail.userame }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ currentDetail.nickName }}</el-descriptions-item>
            <el-descriptions-item label="用户 ID">{{ currentDetail.userId }}</el-descriptions-item>
            <el-descriptions-item label="记录日期">{{ currentDetail.diaryDate }}</el-descriptions-item>
          </el-descriptions>
        </section>

        <section class="detail-section">
          <h4>情绪状态</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="情绪评分">
              <el-rate :model-value="currentDetail.moodScore" :max="10" disabled />
            </el-descriptions-item>
            <el-descriptions-item label="主要情绪">
              <el-tag :type="getEmotionTagType(currentDetail.dominantEmotion)" round>{{ currentDetail.dominantEmotion ||
                '-'
                }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="睡眠质量">{{ currentDetail.sleepQuality || '-' }}/5</el-descriptions-item>
            <el-descriptions-item label="压力水平">{{ currentDetail.stressLevel || '-' }}/5</el-descriptions-item>
          </el-descriptions>
        </section>

        <section class="detail-section">
          <h4>日记内容</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="情绪触发因素">{{ currentDetail.emotionTriggers || '无' }}</el-descriptions-item>
            <el-descriptions-item label="日记内容">{{ currentDetail.diaryContent || '无' }}</el-descriptions-item>
          </el-descriptions>
        </section>

        <section class="detail-section" v-if="Object.keys(aiData).length > 0">
          <h4>AI 情绪分析</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="主要情绪">
              <el-tag :type="getAiEmotionTagType(aiData.primaryEmotion)" round>{{ aiData.primaryEmotion }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="情绪强度">
              <el-progress :percentage="aiData.emotionScore" :color="getEmotionScoreColor(aiData.emotionScore)"
                :stroke-width="8" />
            </el-descriptions-item>
            <el-descriptions-item label="风险等级">
              <el-tag :type="getRiskLevelTagType(aiData.riskLevel)" round>{{ getRiskLevelText(aiData.riskLevel)
                }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="情绪性质">
              <el-tag :type="aiData.isNegative ? 'danger' : 'success'" round>{{ aiData.isNegative ? '负面情绪' : '正面情绪'
                }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <div class="ai-extra">
            <div class="ai-block" v-if="aiData.suggestion">
              <h5>专业建议</h5>
              <p>{{ aiData.suggestion }}</p>
            </div>
            <div class="ai-block" v-if="aiData.riskDescription">
              <h5>风险描述</h5>
              <p>{{ aiData.riskDescription }}</p>
            </div>
            <div class="ai-block" v-if="aiData.improvementSuggestions?.length">
              <h5>改善建议</h5>
              <ul>
                <li v-for="item in aiData.improvementSuggestions" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <h4>时间信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="创建时间">{{ currentDetail.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ currentDetail.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </section>
      </div>
      <template #footer><el-button type="primary" @click="dialogVisible = false">关闭</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import PageHead from '../components/PageHead.vue'
import TableSearch from '../components/TableSearch.vue'
import { getEmotionalPage, deleteEmotional } from '../api/admin.js'
import { ElMessageBox, ElMessage } from 'element-plus'

const getEmotionTagType = (e) => ({ '快乐': 'success', '平静': 'info', '兴奋': 'warning', '愤怒': 'danger', '悲伤': 'info', '焦虑': 'warning' }[e] || 'info')
const getAiEmotionTagType = (e) => ({ '快乐': 'success', '平静': 'success', '兴奋': 'warning', '满足': 'success', '愤怒': 'danger', '悲伤': 'info', '焦虑': 'warning', '恐惧': 'danger', '沮丧': 'info', '压力': 'warning' }[e] || 'info')
const getEmotionScoreColor = (s) => { if (s >= 80) return '#f56c6c'; if (s >= 60) return '#e6a23c'; if (s >= 40) return '#909399'; return '#67c23a' }
const getRiskLevelTagType = (l) => ({ 0: 'success', 1: 'info', 2: 'warning', 3: 'danger' }[l] || 'info')
const getRiskLevelText = (l) => ({ 0: '正常', 1: '关注', 2: '预警', 3: '危机' }[l] || '未知')

const formItem = [
  { comp: 'input', prop: 'userId', label: '用户 ID', placeholder: '请输入用户 ID' },
  {
    comp: 'select', prop: 'moodScreRange', label: '情绪评分', placeholder: '请选择评分范围', options: [
      { label: '低分 (1-3)', value: '1-3' }, { label: '中分 (4-6)', value: '4-6' }, { label: '高分 (7-10)', value: '7-10' }
    ]
  }
]

const tableData = ref([])
const pagination = reactive({ currentPage: 1, size: 10, total: 0 })
const dialogVisible = ref(false)
const currentDetail = ref(null)
const aiData = ref({})

const handleSearch = async (formData) => {
  const params = { ...pagination, ...formData }
  const { records, total } = await getEmotionalPage(params)
  tableData.value = records; pagination.total = total
}

const viewDetail = (row) => { currentDetail.value = row; aiData.value = row.aiEmotionAnalysis ? JSON.parse(row.aiEmotionAnalysis) : {}; dialogVisible.value = true }

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除吗？', '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'danger' }).then(() => {
    deleteEmotional(row.id).then(() => handleSearch())
  })
}

const handleChange = (page) => { pagination.currentPage = page; handleSearch() }
onMounted(() => {
  handleSearch()
})
</script>

<style lang="scss" scoped>
.emotional-admin {
  .table-wrap {
    padding: 0;
    overflow: hidden;
  }

  .life-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .pagination-wrap {
    display: flex;
    justify-content: center;
    padding: 24px 0;
  }
}

.detail-content {
  .detail-section {
    margin-bottom: 20px;

    h4 {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 12px;
      padding-left: 12px;
      border-left: 3px solid var(--brand-400);
    }
  }
}

.ai-extra {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-block {
  padding: 14px;
  background: var(--bg-muted);
  border-radius: var(--r-md);

  h5 {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  ul {
    padding-left: 18px;
  }

  li {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    list-style: disc;
  }
}
</style>
