<template>
  <div class="register-view">
    <button class="back-btn" @click="router.push('/')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
      <span>返回首页</span>
    </button>

    <div class="register-header">
      <h2>创建账户</h2>
      <p>加入心灵港湾，开启自我探索之旅</p>
    </div>

    <el-form label-position="top" :model="formData" :rules="rules" ref="submitFormRef" class="register-form">
      <div class="form-grid">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" size="large" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" size="large" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称（可选）" size="large" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" size="large" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password size="large" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="formData.confirmPassword" type="password" placeholder="请确认密码" show-password size="large" />
        </el-form-item>
      </div>
      <el-button type="primary" @click="submitForm(submitFormRef)" class="submit-btn" size="large" :loading="loading">
        注册
      </el-button>
    </el-form>

    <p class="form-footer">
      已有账户？<router-link to="/auth/login" class="link">立即登录</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { register } from '../api/frontend'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const submitFormRef = ref(null)

const formData = reactive({
  username: '', email: '', nickname: '', phone: '',
  password: '', confirmPassword: '', gender: 0, userType: 1
})

const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }],
})

const submitForm = async (formEl) => {
  if (!formEl) return
  formEl.validate(async () => {
    loading.value = true
    register(formData).then(({ data }) => {
      loading.value = false
      if (!data) {
        ElMessage.success('注册成功')
        router.push('/auth/login')
      } else if (data.code === 'BUSINESS_ERROR') {
        ElMessage.error(data.message)
      }
    }).catch(() => { loading.value = false })
  })
}
</script>

<style lang="scss" scoped>
.register-view { width: 100%; }

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
  margin-bottom: 32px;

  &:hover { border-color: var(--brand-400); color: var(--brand-500); background: var(--brand-50); }
  &:focus-visible { outline: 2px solid var(--brand-400); outline-offset: 2px; }
}

.register-header {
  margin-bottom: 28px;
  h2 {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 6px;
  }
  p { font-size: 15px; color: var(--text-muted); }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
  @media (max-width: 500px) { grid-template-columns: 1fr; }
}

.register-form {
  :deep(.el-form-item__label) { color: var(--text-primary); font-weight: 600; font-size: 14px; padding-bottom: 4px; }
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
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
