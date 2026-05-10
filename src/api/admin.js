import service from '../untils/request'

export function login(data) { //登录认证
    return service.post('/user/login', data)
}

export function categoryTree() { //获取知识分类树
    return service.get('/knowledge/category/tree')
}

export function articlePage(params) { //获取文章分页列表
    return service.get('/knowledge/article/page', { params })
}

export function uploadFile(file, businessInfo) { //上传文件
    const formData = new FormData()
    formData.append('file', file)
    formData.append('businessType', 'ARTICLE')
    formData.append('businessId', businessInfo.businessId)
    formData.append('businessField', 'cover')

    return service.post('/file/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export function createArticle(data) { //创建文章
    return service.post('/knowledge/article', data)
}

export function getArticleDetail(id) { //获取文章详情
    return service.get(`/knowledge/article/${id}`)
}

export function updateArticle(id, data) { //更新文章
    return service.put(`/knowledge/article/${id}`, data)
}

export function changeArticleStatus(id, data) { //更新文章状态
    return service.put(`/knowledge/article/${id}/status`, data)
}

export function deleteArticle(id) { //删除文章
    return service.delete(`/knowledge/article/${id}`)
}

export function getConsultationPage(params) { //分页查询咨询会话
    return service.get('/psychological-chat/sessions', { params })
}

export function getSessionDetail(sessionId) { //获取会话消息列表
    return service.get(`/psychological-chat/sessions/${sessionId}/messages`)
}

export function getEmotionalPage(params) { //分页查询情绪日记
    return service.get(`/emotion-diary/admin/page`, { params })
}


export function deleteEmotional(id) { //删除情绪日记
    return service.delete(`/emotion-diary/admin/${id}`)
}

export function getAnalyticslOverview() { //获取分析总览
    return service.get(`/data-analytics/overview`)
}

export function logout() { //退出登录
    return service.post('/user/logout')
}
