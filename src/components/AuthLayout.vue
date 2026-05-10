<template>
  <div class="auth-shell">
    <!-- 动态 blob 背景 -->
    <div class="blob-stage">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- 玻璃卡片 -->
    <div class="auth-card">
      <div class="card-brand">
        <span class="brand-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </span>
        <h1 class="brand-title">心灵港湾</h1>
      </div>

      <div class="card-form">
        <router-view v-slot="{ Component }">
          <transition name="swap" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>

    <!-- 底部链接 -->
    <p class="auth-footer-text">
      每一次倾诉，都被温柔倾听
    </p>
  </div>
</template>

<style lang="scss" scoped>
.auth-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--grad-hero);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* ---- Animated Blobs ---- */
.blob-stage {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  opacity: 0.35;
  filter: blur(80px);
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: var(--brand-200);
  top: -120px;
  right: -80px;
  animation: blob 14s ease-in-out infinite, float 10s ease-in-out infinite;
}

.blob-2 {
  width: 350px;
  height: 350px;
  background: var(--peach-300);
  bottom: -100px;
  left: -60px;
  animation: blob 12s ease-in-out infinite reverse, float 8s ease-in-out infinite 1s;
}

.blob-3 {
  width: 250px;
  height: 250px;
  background: var(--sage-300);
  top: 40%;
  left: 10%;
  animation: blob 16s ease-in-out infinite 2s, float 9s ease-in-out infinite 3s;
}

/* ---- Glass Card ---- */
.auth-card {
  position: relative;
  z-index: 1;
  width: 440px;
  background: var(--bg-glass);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--border-glass);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-xl);
  padding: 44px 40px;
  animation: fadeUp .6s var(--ease-out);
}

.card-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 36px;
}

.brand-icon {
  width: 64px;
  height: 64px;
  background: var(--grad-brand);
  border-radius: var(--r-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 14px;
  box-shadow: var(--shadow-brand);
}

.brand-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.04em;
}

/* ---- Transition ---- */
.swap-enter-active,
.swap-leave-active {
  transition: all .3s var(--ease-out);
}

.swap-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.swap-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

/* ---- Footer ---- */
.auth-footer-text {
  position: absolute;
  bottom: 28px;
  font-size: 14px;
  color: var(--text-muted);
  z-index: 1;
}

@media (max-width: 500px) {
  .auth-card {
    width: 100%;
    padding: 32px 24px;
  }
}
</style>
