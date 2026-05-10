<template>
  <div class="frontend-shell">
    <!-- 玻璃导航栏 -->
    <header class="nav-glass" :class="{ 'nav-scrolled': scrolled }">
      <div class="nav-inner">
        <router-link to="/" class="nav-brand">
          <span class="brand-mark">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M8 12c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </span>
          <span class="brand-text">心灵港湾</span>
        </router-link>

        <nav class="nav-links">
          <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">首页</router-link>
          <router-link to="/consultation" v-if="loggedIn" class="nav-item" active-class="active">AI 咨询</router-link>
          <router-link to="/emotion-diary" v-if="loggedIn" class="nav-item" active-class="active">情绪日记</router-link>
          <router-link to="/knowledge" class="nav-item" active-class="active">知识库</router-link>
        </nav>

        <div class="nav-actions">
          <button class="theme-btn" @click="toggleTheme" :title="theme === 'light' ? '暗色模式' : '亮色模式'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round">
              <path v-if="theme === 'light'" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              <circle v-else cx="12" cy="12" r="5" />
              <g v-if="theme === 'dark'">
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </g>
            </svg>
          </button>
          <template v-if="loggedIn">
            <button class="btn-ghost" @click="handleLogout">退出</button>
          </template>
          <template v-else>
            <router-link to="/auth/login" class="btn-ghost">登录</router-link>
            <router-link to="/auth/register" class="btn-brand">注册</router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- 页面内容 -->
    <main class="main-stage">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 页脚 -->
    <footer class="footer-glass">
      <div class="footer-inner">
        <div class="footer-left">
          <span class="footer-brand">心灵港湾 · Serenity AI</span>
          <p>每一次倾听，都是温暖的陪伴</p>
        </div>
        <span class="footer-copy">&copy; 2026</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { logout } from '../api/admin'
import { useRouter } from 'vue-router'

const router = useRouter()
const loggedIn = ref(false)
const scrolled = ref(false)
const theme = inject('theme', ref('light'))
const toggleTheme = inject('toggleTheme', () => { })

const handleLogout = () => {
  logout().then(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/auth/login')
  })
}

onMounted(() => {
  loggedIn.value = !!localStorage.getItem('token')
  window.addEventListener('scroll', () => { scrolled.value = window.scrollY > 10 })
})
</script>

<style lang="scss" scoped>
.frontend-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-root);
  transition: background var(--dur-base);
}

/* ---- Glass Nav ---- */
.nav-glass {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-glass);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border-default);
  transition: all var(--dur-base);
}

.nav-scrolled {
  box-shadow: var(--shadow-sm);
}

.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 28px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.brand-mark {
  width: 40px;
  height: 40px;
  background: var(--grad-brand);
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: var(--shadow-brand);
}

.brand-text {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.03em;
}

.nav-links {
  display: flex;
  gap: 4px;
  flex: 1;
}

.nav-item {
  padding: 8px 18px;
  border-radius: var(--r-full);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--dur-base);
}

.nav-item:hover {
  color: var(--brand-400);
  background: var(--brand-50);
}

.nav-item.active {
  color: var(--brand-500);
  background: var(--brand-50);
  font-weight: 600;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.theme-btn {
  width: 38px;
  height: 38px;
  border: 1px solid var(--border-default);
  border-radius: var(--r-full);
  background: var(--bg-glass);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--dur-base);
}

.theme-btn:hover {
  border-color: var(--brand-300);
  color: var(--brand-500);
}

.btn-ghost {
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  border-radius: var(--r-full);
  border: none;
  background: transparent;
  transition: all var(--dur-base);
}

.btn-ghost:hover {
  color: var(--brand-500);
  background: var(--brand-50);
}

.btn-brand {
  padding: 9px 22px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--grad-brand);
  border-radius: var(--r-full);
  box-shadow: var(--shadow-brand);
  transition: all var(--dur-base);
}

.btn-brand:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px var(--brand-glow);
}

/* ---- Page ---- */
.main-stage {
  flex: 1;
}

.page-enter-active,
.page-leave-active {
  transition: opacity .25s ease, transform .25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ---- Footer ---- */
.footer-glass {
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--border-default);
  padding: 28px 0;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-brand {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.footer-left p {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

.footer-copy {
  font-size: 13px;
  color: var(--text-muted);
}
</style>
