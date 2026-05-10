<template>
  <div class="admin-shell">
    <Sidebar />
    <div class="admin-right">
      <header class="admin-topbar">
        <Navbar />
      </header>
      <main class="admin-main">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'

let originalTheme = 'light'

onMounted(() => {
  originalTheme = document.documentElement.getAttribute('data-theme') || 'light'
  document.documentElement.setAttribute('data-theme', 'light')
})

onUnmounted(() => {
  document.documentElement.setAttribute('data-theme', originalTheme)
})
</script>

<style lang="scss" scoped>
.admin-shell {
  display: flex;
  height: 100vh;
  background: var(--bg-root);
  overflow: hidden;
}

.admin-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  height: 60px;
  flex-shrink: 0;
  background: var(--bg-glass);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border-default);
  z-index: 50;
}

.admin-main {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

.page-enter-active,
.page-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
