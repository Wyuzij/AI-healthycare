<template>
  <div class="login-view">
    <button class="back-btn" @click="router.push('/')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
      <span>返回首页</span>
    </button>

    <div class="login-header">
      <h2>欢迎回来</h2>
      <p>登录您的账户，继续心灵之旅</p>
    </div>

    <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-position="top" class="login-form">
      <el-form-item label="用户名或邮箱" prop="username">
        <el-input v-model="formData.username" size="large" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="formData.password" size="large" placeholder="请输入密码" type="password" show-password />
      </el-form-item>
      <el-button class="submit-btn" size="large" type="primary" @click="submitForm(ruleFormRef)" :loading="loading">
        登录
      </el-button>
    </el-form>

    <p class="form-footer">
      还没有账户？<router-link to="/auth/register" class="link">立即注册</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { login } from '../api/admin'
import { useRouter } from 'vue-router'

const router = useRouter()
const ruleFormRef = ref()
const loading = ref(false)

const formData = reactive({ username: '', password: '' })

const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      loading.value = true
      login(formData).then((data) => {
        loading.value = false
        if (!data.token) return console.error('登录失败')
        localStorage.setItem('token', data.token)
        localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
        router.push(data.userInfo.userType === 2 ? '/back/dashboard' : '/')
      }).catch(() => { loading.value = false })
    }
  })
}
</script>

<style lang="scss" scoped>
.login-view { width: 100%; }

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--border-default);
  border-radius: var(--r-full);
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all var(--dur-base);
  margin-bottom: 36px;

  &:hover { border-color: var(--brand-400); color: var(--brand-500); background: var(--brand-50); }
  &:focus-visible { outline: 2px solid var(--brand-400); outline-offset: 2px; }
}

.login-header {
  margin-bottom: 32px;
  h2 {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 6px;
  }
  p { font-size: 15px; color: var(--text-muted); }
}

.login-form {
  :deep(.el-form-item__label) { color: var(--text-primary); font-weight: 600; font-size: 14px; padding-bottom: 4px; }
}

.submit-btn {
  width: 100%;
  margin-top: 12px;
  height: 50px;
  font-size: 16px;
  font-weight: 700;
  border-radius: var(--r-md);
  letter-spacing: 0.04em;
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  .link { color: var(--brand-500); font-weight: 600; }
  .link:hover { color: var(--brand-400); }
}
</style>
