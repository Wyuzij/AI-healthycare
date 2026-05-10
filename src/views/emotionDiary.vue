<template>
  <div class="diary-page">
    <div class="diary-content">
      <div class="diary-card glass-card stagger-1">
        <h3 class="card-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="color: var(--peach-500); margin-right: 8px; display: inline-block; vertical-align: -4px;">
            <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
          今日情绪评分
        </h3>
        <p class="card-sub">您今天的情绪状态如何（1-10分）</p>
        <div class="rating-area">
          <el-rate v-model="diaryForm.moodScore" :texts="emotionalContent" show-text :max="10" size="large" />
        </div>
      </div>

      <div class="diary-card glass-card stagger-2">
        <h3 class="card-title">主要情绪</h3>
        <div class="emotion-grid">
          <div
            v-for="item in emotionOptions"
            :key="item.name"
            class="emotion-tile"
            :class="{ selected: item.name === diaryForm.dominantEmotion }"
            @click="selectEmotion(item.name)"
            :tabindex="0"
            @keydown.enter="selectEmotion(item.name)"
          >
            <span class="emotion-icon">{{ item.icon }}</span>
            <span class="emotion-label">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <div class="diary-card glass-card stagger-3">
        <h3 class="card-title">详情记录</h3>
        <div class="detail-form">
          <div class="form-field">
            <label>情绪触发因素</label>
            <el-input v-model="diaryForm.emotionTriggers" placeholder="今天什么因素影响了您的心情" type="textarea" :rows="3" show-word-limit maxlength="1000" />
          </div>
          <div class="form-field">
            <label>今日感想</label>
            <el-input v-model="diaryForm.diaryContent" placeholder="写下今天的心情..." type="textarea" :rows="5" show-word-limit maxlength="2000" />
          </div>

          <div class="life-row">
            <div class="form-field">
              <label>睡眠质量</label>
              <el-select v-model="diaryForm.sleepQuality" placeholder="请选择" size="large">
                <el-option label="很差" value="1" />
                <el-option label="较差" value="2" />
                <el-option label="一般" value="3" />
                <el-option label="良好" value="4" />
                <el-option label="优秀" value="5" />
              </el-select>
            </div>
            <div class="form-field">
              <label>压力水平</label>
              <el-select v-model="diaryForm.stressLevel" placeholder="请选择" size="large">
                <el-option label="很低" value="1" />
                <el-option label="较低" value="2" />
                <el-option label="中等" value="3" />
                <el-option label="较高" value="4" />
                <el-option label="很高" value="5" />
              </el-select>
            </div>
          </div>

          <div class="action-row">
            <el-button @click="resetForm" size="large" class="btn-reset">重置</el-button>
            <el-button type="primary" @click="submit" size="large" class="btn-submit">提交记录</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { dayjs, ElMessage } from 'element-plus'
import { reactive } from 'vue'
import { addEmotionDiary } from '../api/frontend'

const emotionalContent = ['绝望崩溃', '消沉抑郁', '焦虑烦躁', '低落不悦', '平静淡然', '轻松惬意', '愉悦舒心', '欢欣满足', '兴奋欣喜', '极致幸福']

const emotionOptions = [
  { name: '快乐', icon: '😊' },
  { name: '平静', icon: '😌' },
  { name: '焦虑', icon: '😰' },
  { name: '悲伤', icon: '😢' },
  { name: '兴奋', icon: '🤩' },
  { name: '疲惫', icon: '😴' },
  { name: '惊讶', icon: '😲' },
  { name: '困惑', icon: '🤔' },
]

const selectEmotion = (emotion) => { diaryForm.dominantEmotion = emotion }

const diaryForm = reactive({
  diaryDate: dayjs().format('YYYY-MM-DD'),
  moodScore: null,
  dominantEmotion: '',
  emotionTriggers: '',
  diaryContent: '',
  sleepQuality: null,
  stressLevel: null,
})

const resetForm = () => {
  diaryForm.moodScore = null
  diaryForm.dominantEmotion = ''
  diaryForm.emotionTriggers = ''
  diaryForm.diaryContent = ''
  diaryForm.sleepQuality = null
  diaryForm.stressLevel = null
}

const submit = () => {
  if (diaryForm.moodScore === null) {
    ElMessage.error('请选择心情评分')
    return
  }
  addEmotionDiary(diaryForm).then(() => {
    ElMessage.success('提交成功')
    resetForm()
  })
}
</script>

<style lang="scss" scoped>
.diary-page {
  min-height: calc(100vh - 120px);
  background: var(--bg-root);
}

.diary-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 36px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.diary-card {
  padding: 32px;
}

.card-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.card-sub {
  font-size: 15px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.rating-area {
  padding: 16px 0;
  :deep(.el-rate__text) { font-size: 14px; font-weight: 500; color: var(--peach-500); }
}

.emotion-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.emotion-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  border: 2px solid var(--border-default);
  border-radius: var(--r-md);
  background: var(--bg-surface);
  cursor: pointer;
  transition: all var(--dur-base);

  &:hover { border-color: var(--sage-400); transform: translateY(-2px); }
  &:focus-visible { outline: 2px solid var(--sage-400); outline-offset: 2px; }

  &.selected {
    border-color: var(--sage-500);
    background: var(--sage-50);
    box-shadow: 0 0 0 3px var(--sage-100);
    transform: translateY(-3px);
  }
}

.emotion-icon { font-size: 32px; }
.emotion-label { font-size: 14px; font-weight: 600; color: var(--text-primary); }

.detail-form { margin-top: 8px; }

.form-field {
  margin-bottom: 20px;
  label { display: block; font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
}

.life-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn-reset {
  border-radius: var(--r-md);
  font-weight: 600;
  min-width: 100px;
  height: 48px;
}

.btn-submit {
  border-radius: var(--r-md);
  font-weight: 600;
  min-width: 120px;
  height: 48px;
}

@media (max-width: 640px) {
  .emotion-grid { grid-template-columns: repeat(2, 1fr); }
  .life-row { grid-template-columns: 1fr; }
}
</style>
