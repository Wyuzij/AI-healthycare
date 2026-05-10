<template>
  <div class="knowledge-admin">
    <PageHead title="知识文章">
      <template #buttons>
        <el-button type="primary" @click="handleEdit({})">新增文章</el-button>
      </template>
    </PageHead>

    <TableSearch :formItem="formItem" @search="handleSearch" />

    <div class="table-wrap glass-card">
      <el-table :data="tableData" style="width:100%;" stripe>
        <el-table-column label="文章标题" fixed="left" min-width="240">
          <template #default="scope">
            <div class="cell-title">
              <el-icon>
                <Document />
              </el-icon>
              <span>{{ scope.row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="160">
          <template #default="scope">
            <el-tag round size="small">{{ categoryMap[scope.row.categoryId] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="authorName" label="作者" width="120" />
        <el-table-column prop="readCount" label="阅读量" width="100" />
        <el-table-column prop="updatedAt" label="发布时间" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button class="edit" @click="handleEdit(scope.row)" text size="small">编辑</el-button>
            <el-button @click="handlePublish(scope.row)" v-if="scope.row.status === 0 || scope.row.status === 2" text
              type="success" size="small">发布</el-button>
            <el-button @click="handleUnpublish(scope.row)" v-if="scope.row.status === 1" text type="warning"
              size="small">下线</el-button>
            <el-button @click="handleDelete(scope.row)" text type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-wrap">
      <el-pagination :page-size="pagination.size" layout="prev, pager, next" :total="pagination.total"
        @change="handleChange" />
    </div>

    <ArticleDialog v-model:modelValue="dialogVisible" :article="currentArticle" :categories="categories"
      @success="handleSuccess" />
  </div>
</template>

<script setup>
import PageHead from '../components/PageHead.vue'
import TableSearch from '../components/TableSearch.vue'
import { categoryTree, articlePage, getArticleDetail } from '../api/admin'
import { onMounted, ref, reactive } from 'vue'
import ArticleDialog from '../components/ArticleDialog.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { changeArticleStatus, deleteArticle } from '../api/admin'
import { Document } from '@element-plus/icons-vue'

const formItem = [
  { comp: 'input', prop: 'title', label: '文章标题', placeholder: '请输入文章标题' },
  { comp: 'select', prop: 'categoryId', label: '分类', placeholder: '请选择分类' },
  {
    comp: 'select', prop: 'status', label: '状态', placeholder: '请选择文章状态', options: [
      { label: '已发布', value: 1 }, { label: '草稿', value: 0 }, { label: '已下线', value: 2 }
    ]
  }
]

const pagination = reactive({ currentPage: 1, size: 10, total: 0 })
const categoryMap = reactive({})
const categories = ref([])
const tableData = ref([])
const dialogVisible = ref(false)
const currentArticle = ref({})

const handleSearch = async (formData) => {
  const params = { ...pagination, ...formData }
  const { records, total } = await articlePage(params)
  tableData.value = records
  pagination.total = total
}

const handleChange = (page) => { pagination.currentPage = page; handleSearch() }

const handleSuccess = () => { dialogVisible.value = false; handleSearch() }

const handleEdit = (row) => {
  if (!row.id) { currentArticle.value = {}; dialogVisible.value = true }
  else { getArticleDetail(row.id).then(res => { currentArticle.value = res; dialogVisible.value = true }) }
}

const handlePublish = (row) => {
  ElMessageBox.confirm(`确认发布文章「${row.title}」吗？`, '确认', { confirmButtonText: '确认发布', cancelButtonText: '取消', type: 'info' }).then(() => {
    changeArticleStatus(row.id, { status: 1 }).then(() => { ElMessage.success('发布成功'); handleSearch() })
  })
}

const handleUnpublish = (row) => {
  ElMessageBox.confirm(`确认下线文章「${row.title}」吗？`, '确认', { confirmButtonText: '确认下线', cancelButtonText: '取消', type: 'warning' }).then(() => {
    changeArticleStatus(row.id, { status: 2 }).then(() => { ElMessage.success('下线成功'); handleSearch() })
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除文章「${row.title}」吗？`, '确认', { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'danger' }).then(() => {
    deleteArticle(row.id).then(() => { ElMessage.success('删除成功'); handleSearch() })
  })
}

onMounted(async () => {
  const data = await categoryTree()
  categories.value = data.map(item => { categoryMap[item.id] = item.categoryName; return { label: item.categoryName, value: item.id } })
  formItem[1].options = categories.value
  handleSearch()
})
</script>

<style lang="scss" scoped>
.knowledge-admin {
  .table-wrap {
    padding: 0;
    overflow: hidden;
  }

  .cell-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-primary);
    font-weight: 500;
  }

  .pagination-wrap {
    display: flex;
    justify-content: center;
    padding: 24px 0;
  }
}

.el-tag {
  --el-tag-bg-color: #E6F5F1; // 背景色
  --el-tag-border-color: #B8DFD5; // 边框色
  --el-tag-text-color: #1B5E50; // 文字色
  border-radius: 9999px;
  font-weight: 500;
}
</style>
