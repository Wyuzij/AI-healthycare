<template>
  <aside class="admin-sidebar" :class="{ collapsed: isCollapsed }">
    <!-- 品牌 -->
    <div class="sb-brand">
      <span class="sb-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </span>
      <span v-show="!isCollapsed" class="sb-name">心灵港湾</span>
    </div>

    <!-- 导航 -->
    <nav class="sb-nav">
      <router-link v-for="item in navItems" :key="item.path" :to="`/back/${item.path}`" class="sb-item"
        :class="{ active: route.path.includes(`/back/${item.path}`) }">
        <span class="sb-icon">
          <el-icon :size="19">
            <component :is="item.meta.icon" />
          </el-icon>
        </span>
        <span v-show="!isCollapsed" class="sb-label">{{ item.meta.title }}</span>
      </router-link>
    </nav>

  </aside>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '../stores/admin'

const router = useRouter()
const route = useRoute()
const theme = inject('theme', ref('light'))
const toggleTheme = inject('toggleTheme', () => { })
const toggle = () => toggleTheme()

const isCollapsed = computed(() => useAdminStore().isCollapsed)
const navItems = computed(() => router.options.routes[0]?.children || [])
</script>

<style lang="scss" scoped>
.admin-sidebar {
  width: 232px;
  height: 100vh;
  background: var(--bg-glass);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-right: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  transition: width .3s var(--ease-in-out);
  flex-shrink: 0;
  overflow: hidden;
}

.collapsed {
  width: 64px;
}

.sb-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  border-bottom: 1px solid var(--border-default);
  min-height: 60px;
}

.sb-logo {
  width: 38px;
  height: 38px;
  background: var(--grad-brand);
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: var(--shadow-brand);
}

.sb-name {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.sb-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
}

.sb-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: var(--r-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--dur-base);
  white-space: nowrap;
}

.sb-item:hover {
  background: var(--bg-muted);
  color: var(--brand-400);
}

.sb-item.active {
  background: var(--grad-brand);
  color: #fff;
  box-shadow: var(--shadow-brand);
}

.sb-icon {
  flex-shrink: 0;
  display: flex;
}

.sb-foot {
  padding: 12px 10px;
  border-top: 1px solid var(--border-default);
}

.sb-theme {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-default);
  border-radius: var(--r-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  transition: all var(--dur-base);
  white-space: nowrap;
}

.sb-theme:hover {
  border-color: var(--brand-300);
  color: var(--brand-500);
  background: var(--brand-50);
}
</style>
