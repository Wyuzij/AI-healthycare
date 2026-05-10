<template>
  <div class="rich-text-editor">
    <div class="editor-container">
      <WangToolbar :editor="editorRef" :defaultConfig="toolbarConfig" mode="default" class="editor-toolbar" />
      <WangEditor v-model="content" :defaultConfig="editorConfig" mode="default" class="wang-editor"
        @onCreated="handleEditorCreated" @onChange="handleEditorChange" @onDestroyed="handleEditorDestroyed" />
    </div>

    <div v-if="showWordCount" class="editor-footer">
      <div class="word-count">
        <span class="count-text">{{ currentCharCount }} / {{ maxCharCount }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: Math.min((currentCharCount / maxCharCount) * 100, 100) + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { ElMessage } from 'element-plus'
import '@wangeditor/editor/dist/css/style.css'
import { Editor as WangEditor, Toolbar as WangToolbar } from '@wangeditor/editor-for-vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '请输入内容...' },
  maxCharCount: { type: Number, default: 2000 },
  showWordCount: { type: Boolean, default: true },
  toolbarKeys: {
    type: Array,
    default: () => ['bold', 'italic', 'underline', 'color', 'bgColor', '|', 'fontSize', 'fontFamily', '|', 'header1', 'header2', 'header3', '|', 'bulletedList', 'numberedList', 'blockquote', '|', 'insertLink', '|', 'undo', 'redo']
  },
  minHeight: { type: String, default: '300px' }
})

const emit = defineEmits(['update:modelValue', 'change', 'created'])

const editorRef = shallowRef(null)
const currentCharCount = ref(0)

const content = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const editorConfig = reactive({
  placeholder: props.placeholder,
  MENU_CONF: {
    fontSize: { fontSizeList: ['12px', '13px', '14px', '15px', '16px', '17px', '18px', '19px', '20px', '22px', '24px', '26px', '28px', '30px', '32px', '36px'] },
    fontFamily: { fontFamilyList: ['Arial', 'Tahoma', 'Verdana', '"Times New Roman"', '"Courier New"', '"Microsoft YaHei"', '"微软雅黑"', '"SimSun"', '"宋体"', '"SimHei"', '"黑体"', '"KaiTi"', '"楷体"'] },
    color: {
      colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#1B5E50', '#2D7A6B', '#4A9A8A', '#5A8A6A', '#7FAF8B', '#D4856B', '#E8A87C', '#FF6B6B', '#FF4757', '#DC3545', '#FFA502', '#FF6348', '#F39C12', '#2ED573', '#00B894', '#0984E3', '#3742FA', '#8E44AD', '#FD79A8']
    },
    bgColor: {
      colors: ['#FFFFFF', '#F8F9FA', '#E9ECEF', '#E6F5F1', '#EDF6F0', '#FCF2E8', '#FFF3E0', '#FFEBEE', '#F3E5F5', '#E3F2FD', '#E8F5E8', '#FFE0B2', '#FFFDE7', '#C8E6C9', '#BBDEFB', '#FAFAFA']
    },
    lineHeight: { lineHeightList: ['1', '1.15', '1.2', '1.5', '1.75', '2', '2.5', '3'] }
  }
})

const toolbarConfig = reactive({ toolbarKeys: props.toolbarKeys })

const handleEditorCreated = (editor) => {
  editorRef.value = editor
  updateCharCount()
  emit('created', editor)
}

const handleEditorChange = (editor) => {
  updateCharCount()
  emit('change', { html: editor.getHtml(), text: editor.getText() })
}

const handleEditorDestroyed = () => { editorRef.value = null }

const updateCharCount = () => {
  if (!editorRef.value) return
  const text = editorRef.value.getText()
  const cleanText = text.replace(/\s+/g, ' ').trim()
  currentCharCount.value = cleanText === '' ? 0 : cleanText.length
  if (currentCharCount.value > props.maxCharCount) ElMessage.warning(`内容长度不能超过 ${props.maxCharCount} 字符`)
}

const getHtml = () => editorRef.value ? editorRef.value.getHtml() : ''
const getText = () => editorRef.value ? editorRef.value.getText() : ''
const setHtml = (html) => { if (editorRef.value) editorRef.value.setHtml(html) }
const clear = () => { if (editorRef.value) editorRef.value.clear() }
const insertText = (text) => { if (editorRef.value) editorRef.value.insertText(text) }
const focus = () => { if (editorRef.value) editorRef.value.focus() }

defineExpose({ getHtml, getText, setHtml, clear, insertText, focus, editor: editorRef })

watch(() => props.placeholder, (v) => { editorConfig.placeholder = v })

onBeforeUnmount(() => { if (editorRef.value) editorRef.value.destroy() })
</script>

<style lang="scss" scoped>
.rich-text-editor {
  border: 1px solid var(--border-default);
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--bg-card);
}

.editor-container { display: flex; flex-direction: column; }

.editor-toolbar { border-bottom: 1px solid var(--border-default); }

.wang-editor { min-height: v-bind(minHeight); }

:deep(.w-e-toolbar) {
  border: none;
  background: var(--bg-surface);
  padding: 0.5rem;
  flex-wrap: wrap;
}

:deep(.w-e-toolbar .w-e-bar-item) {
  margin: 0 0.125rem;
  border-radius: var(--r-xs);
  height: 28px;
  min-width: 28px;
  transition: background var(--dur-fast);
}

:deep(.w-e-toolbar .w-e-bar-item:hover) { background: var(--bg-muted); }

:deep(.w-e-toolbar .w-e-bar-item.w-e-bar-item-active) {
  background: var(--brand-50);
  color: var(--brand-500);
  outline: 1px solid var(--brand-300);
}

:deep(.w-e-toolbar .w-e-bar-divider) { margin: 0 0.25rem; }

:deep(.w-e-text-container) {
  background: var(--bg-card);
  padding: 1rem;
}

:deep(.w-e-text-container [data-slate-editor]) {
  min-height: v-bind(minHeight);
  padding: 0;
  line-height: 1.6;
}

:deep(.w-e-text-container [data-slate-editor] p) {
  margin: 0 0 0.5rem 0;
  padding: 0;
}

:deep(.w-e-color-panel) { max-width: 300px; padding: 8px; }
:deep(.w-e-color-panel .w-e-color-list) { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }
:deep(.w-e-color-panel .w-e-color-item) {
  width: 24px; height: 24px; border-radius: var(--r-xs);
  border: 1px solid var(--border-default); cursor: pointer;
  transition: all var(--dur-fast);
  &:hover { transform: scale(1.1); border-color: var(--brand-400); box-shadow: var(--shadow-brand); }
}

:deep(.w-e-select-list) { max-height: 200px; overflow-y: auto; }
:deep(.w-e-select-list .w-e-select-list-item) { padding: 8px 12px; cursor: pointer; transition: background var(--dur-fast);
  &:hover { background: var(--bg-muted); }
  &.selected { background: var(--brand-50); color: var(--brand-500); }
}

:deep(.w-e-text-placeholder) {
  color: var(--text-muted); font-style: normal; padding: 0; margin: 0; line-height: 1.6;
  position: absolute; top: 1rem; left: 1rem; right: 1rem; pointer-events: none; white-space: pre-wrap;
}

:deep(.w-e-panel) {
  z-index: 3000; background: var(--bg-elevated);
  box-shadow: var(--shadow-lg); border-radius: var(--r-md);
  border: 1px solid var(--border-glass); max-width: 320px;
}

.editor-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.5rem 1rem; background: var(--bg-surface); border-top: 1px solid var(--border-default);
}

.word-count { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-muted); }
.count-text { font-weight: 500; }
.progress-bar { width: 60px; height: 4px; background: var(--bg-muted); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--brand-400); transition: width var(--dur-base) var(--ease-out); border-radius: 2px; }

@media (max-width: 768px) {
  :deep(.w-e-toolbar) { padding: 0.375rem; }
  :deep(.w-e-toolbar .w-e-bar-item) { margin: 0 0.0625rem; height: 24px; min-width: 24px; }
  :deep(.w-e-text-container) { padding: 0.75rem; }
  .editor-footer { padding: 0.375rem 0.75rem; }
}
</style>
