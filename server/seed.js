import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

import bcrypt from 'bcryptjs'
import db from './db.js'

console.log('清理旧数据...')
db.exec('DELETE FROM chat_message')
db.exec('DELETE FROM chat_session')
db.exec('DELETE FROM emotion_diary')
db.exec('DELETE FROM knowledge_article')
db.exec('DELETE FROM knowledge_category')
db.exec('DELETE FROM user')
console.log('开始填充...')

const hash = (pwd) => bcrypt.hashSync(pwd, 10)
const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19)
const day = (offset) => {
  const d = new Date(); d.setDate(d.getDate() + offset)
  return d.toISOString().replace('T', ' ').slice(0, 19)
}
const dateOnly = (offset) => {
  const d = new Date(); d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

// --- 用户 ---
const insertUser = db.prepare(`
  INSERT INTO user (username, password, email, nickname, avatar, phone, gender, genderDisplayName, birthday, role, userType, userTypeDisplayName, status, statusDisplayName, displayName, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

insertUser.run('admin', hash('admin123'), 'admin@example.com', '系统管理员',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop',
  '13123456789', 1, '男', '2019-09-02', 'admin', 2, '管理员', 1, '正常', '系统管理员', day(-260), day(-140))
insertUser.run('zhangsan', hash('123456'), 'zhangsan@test.com', '张三',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop',
  '13800001111', 1, '男', '1995-06-15', 'user', 1, '普通用户', 1, '正常', '张三', day(-120), day(-30))
insertUser.run('lisi', hash('123456'), 'lisi@test.com', '李四',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop',
  '13800002222', 0, '保密', '1998-03-20', 'user', 1, '普通用户', 1, '正常', '李四', day(-100), day(-20))
insertUser.run('wangwu', hash('123456'), 'wangwu@test.com', '王五',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop',
  '13800003333', 2, '女', '2000-01-10', 'user', 1, '普通用户', 1, '正常', '王五', day(-80), day(-10))

const admin = db.prepare("SELECT id, username FROM user WHERE username = 'admin'").get()
const zhangsan = db.prepare("SELECT id, username FROM user WHERE username = 'zhangsan'").get()
const lisi = db.prepare("SELECT id, username FROM user WHERE username = 'lisi'").get()
const wangwu = db.prepare("SELECT id, username FROM user WHERE username = 'wangwu'").get()
console.log('用户创建完成')

// --- 分类 ---
const insertCat = db.prepare(`
  INSERT INTO knowledge_category (categoryName, description, sortOrder, parentId, status, statusText, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)
const cats = [
  ['心理科普', '心理学基础知识与科普文章', 10, 0, 1, '正常', day(-260), day(-260)],
  ['情绪管理', '情绪调节与压力管理技巧', 20, 0, 1, '正常', day(-260), day(-260)],
  ['人际关系', '亲密关系与人际沟通指南', 30, 0, 1, '正常', day(-260), day(-260)],
  ['自我成长', '个人成长与潜能开发指导', 40, 0, 1, '正常', day(-260), day(-260)],
]
const catIds = {}
cats.forEach(c => {
  const r = insertCat.run(...c)
  catIds[c[0]] = r.lastInsertRowid
})
console.log('分类创建完成')

// --- 文章 ---
const insertArticle = db.prepare(`
  INSERT INTO knowledge_article (id, categoryId, categoryName, title, summary, content, tags, authorId, authorName, readCount, isFavorited, favoriteCount, status, statusText, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const articleData = [
  {
    title: '认识焦虑：当焦虑来临时我们该怎么办',
    summary: '焦虑是现代人最常见的情绪困扰之一。了解焦虑的来源和应对方法，帮助你更好地与焦虑共处。',
    content: `<p>焦虑是现代人最常见的情绪困扰之一。当我们感到焦虑时，身体会出现心跳加速、手心出汗、肌肉紧绷等反应，这是人类面对威胁时的自然应激机制。</p>
<h3>为什么我们会焦虑？</h3>
<p>焦虑往往源于对未来的不确定感和对失控的恐惧。工作中的压力、人际关系的紧张、健康问题的担忧，都可能成为焦虑的触发因素。</p>
<h3>如何应对焦虑？</h3>
<ol><li><strong>深呼吸练习</strong>：尝试4-7-8呼吸法——吸气4秒，屏息7秒，缓慢呼气8秒</li><li><strong>接纳而非对抗</strong>：承认焦虑的存在，告诉自己"我现在感到焦虑，这是正常的"</li><li><strong>运动释放</strong>：半小时的有氧运动能显著降低焦虑水平</li><li><strong>书写疗愈</strong>：把担忧的事情写下来，往往会发现事情没那么糟</li></ol>
<p>适度的焦虑是成长的朋友，过度的焦虑才需要关注。</p>`,
    tags: '焦虑,情绪管理,心理健康', catKey: '情绪管理', readCount: 1520, status: 1
  },
  {
    title: '正念冥想入门：每天十分钟改变生活',
    summary: '正念冥想源自东方禅修传统，科学验证有效的心理调节方法。从5分钟开始，改变你的生活品质。',
    content: `<p>正念（Mindfulness）源自东方禅修传统，经过西方心理学的科学化改造，已成为最受欢迎的心理调节方法之一。</p>
<h3>什么是正念？</h3>
<p>正念是有意识地将注意力放在当下，不带评判地观察自己的感受、想法和身体感觉。</p>
<h3>初学者练习步骤</h3>
<ol><li>找安静处坐下，保持脊柱直立</li><li>闭眼，注意力放在呼吸上</li><li>思绪飘走时温柔地带回</li><li>从每天5分钟开始，逐步延长到20分钟</li></ol>`,
    tags: '正念,冥想,自我成长', catKey: '自我成长', readCount: 2340, status: 1
  },
  {
    title: '亲密关系中的有效沟通',
    summary: '沟通不畅是许多关系问题的根源。学习非暴力沟通四步法，让两颗心靠得更近。',
    content: `<p>很多亲密关系的问题，根源都在于沟通不畅。我们常常期待对方"懂我"，却忘了清晰地表达自己的需求。</p>
<h3>非暴力沟通四步法</h3>
<ol><li><strong>观察</strong>：描述客观事实，不加评判</li><li><strong>感受</strong>：表达自己的情绪</li><li><strong>需要</strong>：说出背后的需求</li><li><strong>请求</strong>：提出具体的请求</li></ol>`,
    tags: '沟通,亲密关系,人际关系', catKey: '人际关系', readCount: 1890, status: 1
  },
  {
    title: '职场倦怠自救指南',
    summary: '如果你对工作失去热情，可能正在经历职场倦怠。了解三个信号和应对策略。',
    content: `<p>"每天上班像上刑场一样"——如果你有这种感觉，可能正在经历职场倦怠（Burnout）。</p>
<h3>倦怠的三个信号</h3>
<ol><li><strong>情绪耗竭</strong>：感觉被掏空，对工作丧失热情</li><li><strong>去人格化</strong>：对同事和客户变得冷漠</li><li><strong>成就感降低</strong>：觉得自己做的一切都没价值</li></ol>`,
    tags: '职场,倦怠,自我成长', catKey: '自我成长', readCount: 980, status: 1
  },
  {
    title: '走出抑郁情绪：给身处黑暗中的你',
    summary: '抑郁情绪不等同于抑郁症。几个小步骤帮助你慢慢走出阴霾。',
    content: `<p>如果你正在读这篇文章，可能你正在经历一段难熬的时光。首先想告诉你：你不是一个人。</p>
<h3>抑郁情绪 ≠ 抑郁症</h3>
<p>每个人都可能经历抑郁情绪——失去兴趣、精力下降、自我否定。这就像心灵的感冒。</p>
<h3>可以尝试的小步骤</h3>
<ol><li>哪怕下楼走五分钟</li><li>晒晒太阳</li><li>找人聊聊</li><li>做一件小事获得成就感</li><li>对自己温柔一点</li></ol>`,
    tags: '抑郁,情绪调节,自我关怀', catKey: '情绪管理', readCount: 3210, status: 1
  },
  {
    title: '如何判断自己是否需要心理咨询？',
    summary: '心理咨询不是"有病才需要"，而是给心灵做一次体检和保养。',
    content: `<p>很多人对心理咨询存在误解，认为只有"有病"的人才需要。实际上，心理咨询更像是给心灵做一次体检和保养。</p>
<h3>可以考虑咨询的情况</h3>
<ol><li>持续两周以上情绪低落</li><li>睡眠质量明显下降</li><li>人际关系反复出现问题</li><li>经历重大生活事件</li><li>对生活感到迷茫</li></ol>`,
    tags: '心理咨询,科普,入门', catKey: '心理科普', readCount: 2760, status: 1
  },
  {
    title: '原生家庭的影响：理解自己，解放未来',
    summary: '了解原生家庭不是为了审判过去，而是为了解放未来。',
    content: `<p>"原生家庭"一词近年被频繁提及，有人用它理解自己，也有人用来指责父母。</p>
<h3>原生家庭确实重要</h3>
<p>童年经历塑造了我们对世界的理解——如何看待自己，如何看待他人，如何处理情绪。</p>
<h3>走向和解的路径</h3>
<ol><li>看见和理解童年经历</li><li>区分父母和自己的课题</li><li>设定健康的边界</li><li>重新养育内心的小孩</li></ol>`,
    tags: '原生家庭,亲子关系,自我成长', catKey: '人际关系', readCount: 4520, status: 1
  },
  {
    title: '失眠的认知行为疗法',
    summary: 'CBT-I是国际公认的失眠一线治疗方法，不靠药物也能睡个好觉。',
    content: `<p>失眠是困扰现代人的常见问题。认知行为疗法（CBT-I）是国际公认的失眠一线治疗方法。</p>
<h3>重建"床=睡觉"的条件反射</h3>
<ol><li>只有困了才上床</li><li>躺20分钟睡不着就起来做无聊的事</li><li>床只用来睡觉</li><li>每天同一时间起床</li></ol>`,
    tags: '失眠,睡眠,CBT-I', catKey: '心理科普', readCount: 1670, status: 1
  },
  {
    title: '情绪日记写作指南（草稿）',
    summary: '学习如何通过情绪日记更好地了解自己',
    content: '<p>这是一个待发布的草稿...</p>',
    tags: '情绪,日记', catKey: '情绪管理', readCount: 0, status: 0
  },
]

articleData.forEach((a, i) => {
  insertArticle.run(randomUUID(), catIds[a.catKey], a.catKey, a.title, a.summary, a.content, a.tags,
    admin.id, admin.username, a.readCount, 0, Math.floor(Math.random() * 5),
    a.status, a.status === 1 ? '已发布' : '待发布', day(-250 + i * 3), day(-30 + i))
})
console.log(`${articleData.length} 篇文章创建完成`)

// --- 聊天会话 + 消息 ---
const insertSession = db.prepare(`
  INSERT INTO chat_session (userId, sessionTitle, startedAt, updatedAt, durationMinutes, lastMessageContent, lastMessageTime)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)
const insertMsg = db.prepare(`
  INSERT INTO chat_message (sessionId, role, senderType, content, createdAt)
  VALUES (?, ?, ?, ?, ?)
`)

const conversations = [
  {
    user: zhangsan, title: '最近工作压力很大',
    messages: [
      ['user', 1, '最近工作压力真的好大，每天加班到很晚，回到家什么都不想做，感觉整个人都被掏空了。'],
      ['assistant', 2, '听到你这样说，我能感受到你的疲惫和无力感。长时间的高压工作确实会让人身心俱疲。你能具体说说，是什么样的工作内容或情况让你感到最有压力吗？'],
      ['user', 1, '主要是项目deadline太紧了，老板又在不断加需求，我总觉得自己做不完，晚上睡觉都在想工作的事。'],
      ['assistant', 2, '项目期限加上不断变化的需求，任何人都会感到焦虑。你的睡眠和饮食情况怎么样？这两样是支撑我们应对压力的基础。'],
      ['user', 1, '睡眠很差，经常凌晨三四点醒，然后就再也睡不着了。胃口也不好。'],
      ['assistant', 2, '睡眠和饮食已经受到影响，说明压力到了一个需要认真对待的程度。今晚试试睡前放下手机，做腹式呼吸；明天早上无论如何吃一顿早餐。你觉得这两个小目标可行吗？'],
    ]
  },
  {
    user: zhangsan, title: '和朋友闹矛盾了',
    messages: [
      ['user', 1, '我昨天和一个认识十年的好朋友大吵了一架，说了很多伤人的话，现在不知道该怎么面对她。'],
      ['assistant', 2, '十年的友谊，一次争吵确实很让人难过。能维持十年的友谊，说明你们之间有很深的连接。这次争吵是因为什么引起的呢？'],
      ['user', 1, '她觉得我最近总是爽约，不够重视她。但我是真的工作太忙了，她说的话让我觉得很委屈。'],
      ['assistant', 2, '听起来你们双方都有自己的立场——她在乎你的陪伴，而你在努力工作之余也尽力了。如果现在让你给她发一条消息，你会想说什么？'],
    ]
  },
  {
    user: lisi, title: '对未来很迷茫',
    messages: [
      ['user', 1, '我今年28岁了，身边的朋友都买房结婚了，我却连自己想做什么都不确定，感觉人生好失败。'],
      ['assistant', 2, '28岁就对自己的人生有这种反思，这本身是一种成熟的表现。每个人都有自己的节奏。你最感到不确定的是职业方向、感情状态，还是其他方面？'],
      ['user', 1, '主要是职业方向。现在的工作不讨厌但也不喜欢，换工作又不知道想做什么。'],
      ['assistant', 2, '"不讨厌也不喜欢"——这种感觉其实很常见。与其急于找到一个"完美方向"，不如先做些小探索。过去有没有什么事情，让你在做的时候完全忘记了时间？'],
    ]
  },
]

conversations.forEach((c, ci) => {
  const offsets = [-4 + ci * 2, -3 + ci * 2]
  const lastMsg = c.messages[c.messages.length - 1][2]
  const r = insertSession.run(c.user.id, c.title, day(offsets[0]), day(offsets[1]),
    Math.floor(Math.random() * 20) + 5, lastMsg, day(offsets[1]))
  let offsetHours = 0
  c.messages.forEach(([role, senderType, content]) => {
    insertMsg.run(r.lastInsertRowid, role, senderType, content, day(offsets[0])?.slice(0, 10) + ' ' + String(9 + offsetHours).padStart(2, '0') + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0') + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0'))
    offsetHours++
  })
})
console.log('聊天会话创建完成')

// --- 情绪日记 ---
const insertDiary = db.prepare(`
  INSERT INTO emotion_diary (userId, username, diaryDate, moodScore, dominantEmotion, emotionTriggers, diaryContent, diaryContentPreview, sleepQuality, stressLevel, contentLength, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const diaries = [
  { u: zhangsan, date: dateOnly(-3), mood: 4, emotion: '焦虑', trigger: '工作压力', content: '今天项目评审没通过，压力好大。晚上睡不着，一直在想哪里出了问题。明天要和团队重新讨论方案。', sleep: 4, stress: 7 },
  { u: zhangsan, date: dateOnly(-2), mood: 7, emotion: '平静', trigger: '散步', content: '下班去公园散了会步，看到夕阳很美。突然觉得很多烦恼其实没那么严重，慢慢来就好。', sleep: 6, stress: 5 },
  { u: zhangsan, date: dateOnly(-1), mood: 9, emotion: '开心', trigger: '户外活动', content: '周末和朋友去爬山了！好久没这么放松过，大自然真的有治愈的力量。山顶的风好舒服。', sleep: 8, stress: 3 },
  { u: zhangsan, date: dateOnly(0), mood: 5, emotion: '疲惫', trigger: '加班', content: '加班到晚上十点，好累。不过想到下周有个小长假，又有了一点动力。坚持住。', sleep: 5, stress: 6 },
  { u: lisi, date: dateOnly(-4), mood: 3, emotion: '悲伤', trigger: '情感', content: '看到前任发了新恋情的朋友圈，虽然分手很久了，心里还是酸酸的。也许我还没有完全放下。', sleep: 5, stress: 5 },
  { u: lisi, date: dateOnly(-3), mood: 8, emotion: '开心', trigger: '烘焙', content: '今天学会了做提拉米苏！虽然模样不太好看，但味道还不错。给自己点个赞。', sleep: 7, stress: 3 },
  { u: lisi, date: dateOnly(-2), mood: 5, emotion: '困惑', trigger: '职业发展', content: '老板问我对职业发展有什么想法，我其实完全不知道。该继续做技术还是转管理呢？好迷茫。', sleep: 6, stress: 5 },
  { u: lisi, date: dateOnly(-1), mood: 4, emotion: '焦虑', trigger: '经济压力', content: '月底要交房租了，存款越来越少，是时候认真考虑理财了。不能再月光下去了。', sleep: 4, stress: 7 },
  { u: wangwu, date: dateOnly(-2), mood: 7, emotion: '平静', trigger: '阅读', content: '今天在家读了一本书《被讨厌的勇气》，收获很多。课题分离这个概念让我想通了很多事。', sleep: 7, stress: 4 },
  { u: wangwu, date: dateOnly(-1), mood: 8, emotion: '惊讶', trigger: '老友消息', content: '好久不联系的老同学突然发消息，说下个月要结婚了。时间过得好快，大家都长大了。', sleep: 7, stress: 3 },
  { u: wangwu, date: dateOnly(0), mood: 6, emotion: '疲惫', trigger: '家庭责任', content: '带爸妈去医院体检，跑了一整天。虽然累，但看到他们身体没什么大问题，心里踏实了很多。', sleep: 6, stress: 5 },
]

diaries.forEach(d => {
  const p = d.content.slice(0, 50)
  const n = now()
  insertDiary.run(d.u.id, d.u.username, d.date, d.mood, d.emotion, d.trigger, d.content, p, d.sleep, d.stress, d.content.length, n, n)
})
console.log('情绪日记创建完成')

console.log('\n--- 数据填充完毕 ---')
console.log('管理员: admin / admin123')
console.log('普通用户: zhangsan / 123456')
console.log('普通用户: lisi / 123456')
console.log('普通用户: wangwu / 123456')
