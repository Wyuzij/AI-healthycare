<script setup>
import { ref, onMounted, watch, provide } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'light')

const applyTheme = (t) => {
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('theme', t)
}

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

onMounted(() => applyTheme(theme.value))
watch(theme, applyTheme)

provide('theme', theme)
provide('toggleTheme', toggleTheme)
</script>

<template>
  <router-view />
</template>
