<template>
  <div class="dashboard-page">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner glass-card stagger-1">
      <div class="welcome-text">
        <h2>数据分析仪表盘</h2>
        <p>系统运行概况与情绪健康趋势</p>
      </div>
      <div class="welcome-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div v-for="(stat, i) in statCards" :key="stat.label" class="stat-card glass-card" :style="{ animationDelay: `${i * 0.08}s` }">
        <div class="stat-icon-wrap" :class="stat.color">
          <svg v-if="stat.color === 'brand'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <svg v-if="stat.color === 'sage'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <svg v-if="stat.color === 'peach'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <svg v-if="stat.color === 'muted'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-sub">{{ stat.sub }}</span>
        </div>
      </div>
    </div>

    <!-- 图表行 -->
    <div class="charts-row">
      <div class="chart-card glass-card stagger-2">
        <div class="chart-header">情绪趋势分析</div>
        <div class="chart-body"><div ref="emotionChartRef" style="width:100%;height:320px;"></div></div>
      </div>
      <div class="chart-card glass-card stagger-3">
        <div class="chart-header">咨询会话统计</div>
        <div class="chart-body">
          <div v-if="aiData.consultationStats" class="mini-stats">
            <div class="mini-stat"><span class="mini-val">{{ aiData.consultationStats.totalSessions }}</span><span class="mini-label">总会话数</span></div>
            <div class="mini-stat"><span class="mini-val">{{ aiData.consultationStats.avgDurationMinutes }}min</span><span class="mini-label">平均时长</span></div>
            <div class="mini-stat"><span class="mini-val">{{ aiData.systemOverview?.activeUsers || 0 }}</span><span class="mini-label">活跃用户</span></div>
          </div>
          <div ref="consultationChartRef" style="width:100%;height:260px;"></div>
        </div>
      </div>
    </div>

    <div class="chart-card glass-card full-width stagger-4">
      <div class="chart-header">用户活跃度趋势</div>
      <div class="chart-body"><div ref="userActivityChartRef" style="width:100%;height:320px;"></div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAnalyticslOverview } from '../api/admin.js'
import * as echarts from 'echarts'

const aiData = ref({})

const statCards = computed(() => {
  const o = aiData.value.systemOverview || {}
  return [
    { label: '总用户数', value: o.totalUsers || 0, sub: `活跃 ${o.activeUsers || 0}`, color: 'brand' },
    { label: '情绪日志', value: o.totalDiaries || 0, sub: `今日 +${o.todayNewDiaries || 0}`, color: 'sage' },
    { label: '咨询会话', value: o.totalSessions || 0, sub: `今日 +${o.todayNewSessions || 0}`, color: 'peach' },
    { label: '评价情绪', value: `${o.avgMoodScore || 0}/10`, sub: '情绪健康指数', color: 'muted' },
  ]
})

let emotionChart, consultationChart, userActivityChart
const emotionChartRef = ref(null)
const consultationChartRef = ref(null)
const userActivityChartRef = ref(null)

const chartColors = {
  text: '#7A8A84',
  line: '#EDE0D5',
  brand: '#2D7A6B',
  brandLight: '#7FBFB0',
  peach: '#E8A87C',
  peachLight: '#F0C4A0',
  sage: '#7FAF8B',
  sageLight: '#A8CDB5',
  danger: '#E0A090',
}

const initEmotionChart = () => {
  if (!emotionChartRef.value) return
  emotionChart?.dispose()
  emotionChart = echarts.init(emotionChartRef.value)
  const data = aiData.value.emotionTrend || []
  emotionChart.setOption({
    tooltip: { trigger: 'axis', borderColor: 'var(--border-strong)', borderWidth: 1 },
    legend: { data: ['平均情绪评分', '记录数量'], top: 8, textStyle: { color: chartColors.text } },
    grid: { left: '3%', right: '4%', top: 48, bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.map(d => d.date), axisLine: { lineStyle: { color: chartColors.line } } },
    yAxis: [
      { type: 'value', name: '评分', axisLine: { lineStyle: { color: chartColors.line } } },
      { type: 'value', name: '数量', axisLine: { lineStyle: { color: chartColors.line } } }
    ],
    series: [
      { name: '平均情绪评分', type: 'line', data: data.map(d => d.avgMoodScore), smooth: true, lineStyle: { width: 3, color: chartColors.peach }, itemStyle: { color: chartColors.peach } },
      { name: '记录数量', type: 'line', yAxisIndex: 1, data: data.map(d => d.recordCount), smooth: true, lineStyle: { width: 3, color: chartColors.sage }, itemStyle: { color: chartColors.sage } },
    ]
  })
}

const initConsultationChart = () => {
  if (!consultationChartRef.value) return
  consultationChart?.dispose()
  consultationChart = echarts.init(consultationChartRef.value)
  const data = aiData.value.consultationStats?.dailyTrend || []
  consultationChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['会话数量', '参与用户数'], top: 8, textStyle: { color: chartColors.text } },
    grid: { left: '3%', right: '4%', top: 48, bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.map(d => d.date), axisLine: { lineStyle: { color: chartColors.line } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'var(--border-default)' } } },
    series: [
      { name: '会话数量', type: 'bar', data: data.map(d => d.sessionCount), barWidth: '40%', itemStyle: { borderRadius: [6, 6, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: chartColors.peachLight }, { offset: 1, color: chartColors.peach }] } } },
      { name: '参与用户数', type: 'bar', data: data.map(d => d.userCount), barWidth: '40%', itemStyle: { borderRadius: [6, 6, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: chartColors.sageLight }, { offset: 1, color: chartColors.sage }] } } },
    ]
  })
}

const initUserActivityChart = () => {
  if (!userActivityChartRef.value) return
  userActivityChart?.dispose()
  userActivityChart = echarts.init(userActivityChartRef.value)
  const data = aiData.value.userActivity || []
  userActivityChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['活跃用户', '新增用户', '日记用户', '咨询用户'], top: 8, textStyle: { color: chartColors.text } },
    grid: { left: '3%', right: '4%', top: 48, bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.map(d => d.date), axisLine: { lineStyle: { color: chartColors.line } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'var(--border-default)' } } },
    series: [
      { name: '活跃用户', type: 'line', data: data.map(d => d.activeUsers), smooth: true, lineStyle: { width: 3, color: chartColors.brand }, itemStyle: { color: chartColors.brand } },
      { name: '新增用户', type: 'line', data: data.map(d => d.newUsers), smooth: true, lineStyle: { width: 2, color: chartColors.peach }, itemStyle: { color: chartColors.peach } },
      { name: '日记用户', type: 'line', data: data.map(d => d.diaryUsers), smooth: true, lineStyle: { width: 2, color: chartColors.sage }, itemStyle: { color: chartColors.sage } },
      { name: '咨询用户', type: 'line', data: data.map(d => d.consultationUsers), smooth: true, lineStyle: { width: 2, color: chartColors.danger }, itemStyle: { color: chartColors.danger } },
    ]
  })
}

const initAllCharts = () => { initEmotionChart(); initConsultationChart(); initUserActivityChart() }

onMounted(() => {
  getAnalyticslOverview().then(res => { aiData.value = res; setTimeout(initAllCharts, 100) })
})
</script>

<style lang="scss" scoped>
.dashboard-page { display: flex; flex-direction: column; gap: 20px; }

.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  animation: fadeUp .5s var(--ease-out);
  h2 { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
  p { font-size: 14px; color: var(--text-muted); }
}
.welcome-icon { color: var(--brand-400); opacity: 0.6; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px;
  animation: fadeUp .5s var(--ease-out) both;
  &:hover { transform: translateY(-3px); }
}
.stat-icon-wrap {
  width: 52px; height: 52px;
  border-radius: var(--r-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  &.brand { background: linear-gradient(135deg, var(--brand-400), var(--brand-500)); color: #fff; }
  &.sage { background: linear-gradient(135deg, var(--sage-300), var(--sage-400)); color: #fff; }
  &.peach { background: linear-gradient(135deg, var(--peach-300), var(--peach-400)); color: #fff; }
  &.muted { background: linear-gradient(135deg, var(--text-muted), var(--text-secondary)); color: #fff; }
}
.stat-info { display: flex; flex-direction: column; }
.stat-label { font-size: 13px; color: var(--text-muted); }
.stat-value { font-size: 26px; font-weight: 700; color: var(--text-primary); font-family: var(--font-display); margin: 2px 0; }
.stat-sub { font-size: 12px; color: var(--text-muted); }

.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chart-card { overflow: hidden; }
.chart-card.full-width { grid-column: 1 / -1; }
.chart-header {
  padding: 16px 20px;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-default);
}
.chart-body { padding: 12px; min-height: 280px; }

.mini-stats { display: flex; justify-content: space-around; margin-bottom: 8px; }
.mini-stat { text-align: center; }
.mini-val { display: block; font-size: 20px; font-weight: 700; color: var(--brand-500); font-family: var(--font-display); }
.mini-label { font-size: 12px; color: var(--text-muted); }

@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .charts-row { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .stats-row { grid-template-columns: 1fr; }
}
</style>
