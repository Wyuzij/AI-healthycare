<template>
  <div class="topbar">
    <div class="tb-left">
      <button class="tb-collapse" @click="useAdminStore().toggleCollapsed()">
        <el-icon :size="18"><Expand /></el-icon>
      </button>
      <span class="tb-title">{{ route.meta?.title || '管理后台' }}</span>
    </div>

    <div class="tb-right">
      <el-dropdown @command="handleCmd" trigger="click">
        <div class="tb-user">
          <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <span class="tb-name">Admin</span>
          <el-icon :size="14" class="tb-arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { Expand, ArrowDown, SwitchButton } from '@element-plus/icons-vue'
import { useAdminStore } from '../stores/admin'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { logout } from '../api/admin'

const router = useRouter()
const route = useRoute()

const handleCmd = (cmd) => {
  if (cmd !== 'logout') return
  ElMessageBox.confirm('确定退出登录吗？', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    logout().then(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/auth/login')
    })
  })
}
</script>

<style lang="scss" scoped>
.topbar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.tb-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tb-collapse {
  width: 34px;
  height: 34px;
  border: 1px solid var(--border-default);
  border-radius: var(--r-sm);
  background: transparent;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--dur-base);
}

.tb-collapse:hover {
  border-color: var(--brand-300);
  color: var(--brand-500);
}

.tb-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.tb-right { display: flex; align-items: center; }

.tb-user {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 5px 14px;
  border-radius: var(--r-full);
  cursor: pointer;
  transition: background var(--dur-fast);
}

.tb-user:hover { background: var(--bg-muted); }

.tb-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.tb-arrow {
  color: var(--text-muted);
  transition: transform var(--dur-base);
}

.tb-user:hover .tb-arrow { transform: rotate(180deg); }
</style>
