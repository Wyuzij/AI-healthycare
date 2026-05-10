<template>
  <div class="home-page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-blob hb-1"></div>
      <div class="hero-blob hb-2"></div>

      <div class="hero-grid">
        <div class="hero-text">
          <span class="hero-badge">AI 心理健康助手</span>
          <h1>
            一次温暖的对话<br/>
            <span class="gradient-text">化孤独为慰藉</span>
          </h1>
          <p>每个深夜，每个焦虑的时刻，我们都在这里。不必独自承受，让心与心的连接温暖您的每一天。</p>
          <div class="hero-btns">
            <router-link to="/consultation" class="btn-primary-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              开始倾诉
            </router-link>
            <router-link to="/emotion-diary" class="btn-outline-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              记录心情
            </router-link>
          </div>
        </div>

        <div class="hero-visual">
          <div class="visual-blob">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" opacity="0.3"/>
              <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" opacity="0.5"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Bento Grid Features -->
    <section class="bento">
      <div class="bento-grid">
        <div class="bento-card tall stagger-1">
          <span class="bento-emoji">🤖</span>
          <h3>AI 智能倾听</h3>
          <p>24小时在线的专业心理咨询助手，理解你的每一份情绪，用温暖的对话陪伴你度过每一个时刻。</p>
        </div>
        <div class="bento-card stagger-2">
          <span class="bento-emoji">🌿</span>
          <h3>情绪花园</h3>
          <p>记录每日心情，让AI分析你的情绪变化，看见自己的成长轨迹。</p>
        </div>
        <div class="bento-card stagger-3">
          <span class="bento-emoji">📚</span>
          <h3>知识库</h3>
          <p>丰富的心理健康内容，从情绪管理到压力应对，学会更好地照顾自己。</p>
        </div>
        <div class="bento-card wide stagger-4">
          <span class="bento-emoji">💝</span>
          <h3>每次倾诉都被郑重对待</h3>
          <p>我们相信，真正的治愈来自被理解的体验。无论何时，这里都有一双愿意倾听的耳朵。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.home-page { overflow: hidden; }

/* ---- Hero ---- */
.hero {
  position: relative;
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  background: var(--grad-hero);
  overflow: hidden;
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
  pointer-events: none;
}

.hb-1 {
  width: 600px; height: 600px;
  background: var(--brand-200);
  top: -200px; right: -150px;
  animation: blob 16s ease-in-out infinite, float 12s ease-in-out infinite;
}

.hb-2 {
  width: 400px; height: 400px;
  background: var(--peach-300);
  bottom: -120px; left: -80px;
  animation: blob 14s ease-in-out infinite reverse, float 10s ease-in-out infinite 2s;
}

.hero-grid {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 28px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-text {
  animation: fadeUp .7s var(--ease-out);

  .hero-badge {
    display: inline-block;
    padding: 6px 16px;
    background: var(--brand-50);
    color: var(--brand-500);
    border-radius: var(--r-full);
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 20px;
  }

  h1 {
    font-size: 48px;
    font-weight: 800;
    line-height: 1.15;
    color: var(--text-primary);
    margin-bottom: 18px;
    letter-spacing: -0.02em;
  }

  p {
    font-size: 17px;
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: 32px;
    max-width: 440px;
  }
}

.hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }

.btn-primary-lg {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 30px;
  background: var(--grad-brand);
  color: #fff;
  border-radius: var(--r-full);
  font-size: 15px;
  font-weight: 600;
  box-shadow: var(--shadow-brand);
  transition: all var(--dur-base);
}

.btn-primary-lg:hover { transform: translateY(-2px); box-shadow: 0 8px 28px var(--brand-glow); }

.btn-outline-lg {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 30px;
  border: 2px solid var(--border-strong);
  color: var(--text-primary);
  border-radius: var(--r-full);
  font-size: 15px;
  font-weight: 600;
  background: transparent;
  transition: all var(--dur-base);
}

.btn-outline-lg:hover { border-color: var(--brand-400); color: var(--brand-500); background: var(--brand-50); }

.hero-visual {
  display: flex;
  justify-content: center;
  animation: fadeUp .7s var(--ease-out) .2s both;
}

.visual-blob {
  width: 280px; height: 280px;
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-glass);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-400);
  box-shadow: var(--shadow-xl);
  animation: breathe 5s ease-in-out infinite;
}

/* ---- Bento ---- */
.bento {
  max-width: 1100px;
  margin: 0 auto;
  padding: 64px 28px 80px;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.bento-card {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-glass);
  border-radius: var(--r-lg);
  padding: 32px 28px;
  transition: all var(--dur-base);

  &:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

  &.tall { grid-row: span 2; }
  &.wide { grid-column: span 2; }
}

.bento-emoji { font-size: 40px; display: block; margin-bottom: 16px; }

.bento-card h3 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.bento-card p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.65;
}

@media (max-width: 768px) {
  .hero-grid { grid-template-columns: 1fr; text-align: center; gap: 40px; }
  .hero-text p { max-width: 100%; }
  .hero-btns { justify-content: center; }
  .hero-text h1 { font-size: 34px; }
  .bento-grid { grid-template-columns: 1fr; }
  .bento-card.wide { grid-column: span 1; }
}
</style>
