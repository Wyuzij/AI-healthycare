import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new Database(join(__dirname, 'data.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT DEFAULT '',
    nickname TEXT,
    avatar TEXT,
    phone TEXT DEFAULT '',
    gender INTEGER DEFAULT 0,
    genderDisplayName TEXT DEFAULT '保密',
    birthday TEXT,
    role TEXT DEFAULT 'user',
    userType INTEGER DEFAULT 1,
    userTypeDisplayName TEXT DEFAULT '普通用户',
    status INTEGER DEFAULT 1,
    statusDisplayName TEXT DEFAULT '正常',
    displayName TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    sessionTitle TEXT DEFAULT '新对话',
    startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    durationMinutes INTEGER DEFAULT 0,
    lastMessageContent TEXT,
    lastMessageTime DATETIME,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS chat_message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId INTEGER NOT NULL,
    role TEXT NOT NULL,
    senderType INTEGER DEFAULT 1,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sessionId) REFERENCES chat_session(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS emotion_diary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    username TEXT DEFAULT '',
    diaryDate TEXT NOT NULL,
    moodScore INTEGER DEFAULT 5,
    dominantEmotion TEXT DEFAULT '平静',
    emotionTriggers TEXT DEFAULT '',
    diaryContent TEXT DEFAULT '',
    diaryContentPreview TEXT DEFAULT '',
    sleepQuality INTEGER DEFAULT 5,
    stressLevel INTEGER DEFAULT 3,
    hasAiEmotionAnalysis INTEGER DEFAULT 0,
    aiAnalysisStatus TEXT DEFAULT 'PENDING',
    contentLength INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS knowledge_category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryName TEXT NOT NULL,
    description TEXT DEFAULT '',
    sortOrder INTEGER DEFAULT 0,
    parentId INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    statusText TEXT DEFAULT '正常',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS knowledge_article (
    id TEXT PRIMARY KEY,
    categoryId INTEGER,
    categoryName TEXT DEFAULT '',
    title TEXT NOT NULL,
    summary TEXT DEFAULT '',
    content TEXT,
    tags TEXT DEFAULT '',
    authorId INTEGER,
    authorName TEXT DEFAULT '',
    readCount INTEGER DEFAULT 0,
    isFavorited INTEGER DEFAULT 0,
    favoriteCount INTEGER DEFAULT 0,
    coverImage TEXT DEFAULT '',
    status INTEGER DEFAULT 0,
    statusText TEXT DEFAULT '待发布',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES knowledge_category(id) ON DELETE SET NULL,
    FOREIGN KEY (authorId) REFERENCES user(id) ON DELETE SET NULL
  );
`)

// 迁移：为已有数据库添加 coverImage 列
try {
  db.exec('ALTER TABLE knowledge_article ADD COLUMN coverImage TEXT DEFAULT \'\'')
} catch { /* 列已存在则忽略 */ }

// 默认分类
const catCount = db.prepare('SELECT COUNT(*) as count FROM knowledge_category').get()
if (catCount.count === 0) {
  const insertCat = db.prepare(
    'INSERT INTO knowledge_category (categoryName, description, sortOrder, parentId, status, statusText) VALUES (?, ?, ?, ?, ?, ?)'
  )
  insertCat.run('心理科普', '心理学基础知识与科普文章', 10, 0, 1, '正常')
  insertCat.run('情绪管理', '情绪调节与压力管理', 20, 0, 1, '正常')
  insertCat.run('人际关系', '亲密关系与人际沟通', 30, 0, 1, '正常')
  insertCat.run('自我成长', '个人成长与潜能开发', 40, 0, 1, '正常')
}

export default db
