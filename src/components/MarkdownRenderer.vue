<template>
  <div class="markdown-content" :class="{ 'ai-markdown': isAiMessage }">
    <div v-html="renderedContent"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: { type: String, required: true },
  isAiMessage: { type: Boolean, default: false }
})

const renderedContent = computed(() => {
  let html = props.content
  html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  html = html.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (_, lang, code) => `<pre class="code-block"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`)
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  html = html.replace(/^- (.*)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')
  html = html.replace(/^---$/gm, '<hr>')
  html = html.replace(/\n/g, '<br>')
  html = html.replace(/<br><br>/g, '<br>')
  return html
})
</script>

<style lang="scss" scoped>
.markdown-content {
  line-height: 1.7;
  color: inherit;
  font-size: 15px;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin: 1em 0 0.5em;
  font-weight: 700;
  line-height: 1.3;
  font-family: var(--font-display);
}

.markdown-content :deep(h1) { font-size: 1.5em; border-bottom: 2px solid var(--border-default); padding-bottom: 0.3em; color: var(--text-primary); }
.markdown-content :deep(h2) { font-size: 1.25em; color: var(--text-primary); }
.markdown-content :deep(h3) { font-size: 1.1em; color: var(--text-secondary); }
.markdown-content :deep(p) { margin: 0.5em 0; }
.markdown-content :deep(ul), .markdown-content :deep(ol) { margin: 0.5em 0; padding-left: 1.5em; }
.markdown-content :deep(li) { margin: 0.3em 0; }

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--sage-400);
  padding: 0.5em 1em;
  margin: 1em 0;
  color: var(--text-secondary);
  font-style: italic;
  background: var(--bg-muted);
  border-radius: 0 var(--r-sm) var(--r-sm) 0;
}

.ai-markdown :deep(blockquote) {
  border-left-color: var(--sage-400);
  background: var(--sage-50);
}

[data-theme="dark"] .ai-markdown :deep(blockquote) {
  background: rgba(127,175,139,0.06);
}

.markdown-content :deep(hr) { border: none; border-top: 2px solid var(--border-default); margin: 1.5em 0; }

.markdown-content :deep(code.inline-code) {
  background: var(--bg-muted);
  padding: 0.2em 0.4em;
  border-radius: var(--r-xs);
  font-family: var(--font-mono);
  font-size: 0.85em;
  color: var(--brand-500);
}

.ai-markdown :deep(code.inline-code) {
  background: rgba(27,94,80,0.08);
  color: var(--brand-500);
}

.markdown-content :deep(pre.code-block) {
  background: #1A2A26;
  color: #D4EADB;
  padding: 1em;
  border-radius: var(--r-md);
  overflow-x: auto;
  margin: 1em 0;
  font-family: var(--font-mono);
  font-size: 0.85em;
  line-height: 1.5;
}

.markdown-content :deep(pre.code-block code) { background: none; padding: 0; color: inherit; }

.markdown-content :deep(a) {
  color: var(--brand-500);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color var(--dur-base);
}

.markdown-content :deep(a:hover) { border-bottom-color: var(--brand-500); }

.ai-markdown :deep(a) { color: var(--sage-500); }
.ai-markdown :deep(a:hover) { border-bottom-color: var(--sage-500); }

.markdown-content :deep(strong) { font-weight: 700; color: var(--text-primary); }
.ai-markdown :deep(strong) { color: var(--brand-500); }

.markdown-content :deep(em) { font-style: italic; color: var(--text-secondary); }
</style>
