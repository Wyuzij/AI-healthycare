<template>
  <div class="page-head">
    <p class="page-title">{{ props.title }}</p>
    <div class="action-button">
      <slot name="buttons"></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '页面标题' }
})
</script>

<style lang="scss" scoped>
.page-head {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .page-title {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.01em;
    position: relative;
    padding-left: 16px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 26px;
      background: var(--grad-brand);
      border-radius: 2px;
    }
  }
}
</style>
