## 数据库使用

本项目使用 Cloudflare D1 数据库来存储站点和用户信息。

### 数据表结构

#### 站点表 (sites)
- id: INTEGER PRIMARY KEY AUTOINCREMENT - 自增主键
- suid: TEXT NOT NULL UNIQUE - 创建站点数据时生成的uid，可通过suid查找到站点
- token: TEXT NOT NULL - 授权令牌
- name: TEXT NOT NULL - 站点名称
- url: TEXT NOT NULL - 站点地址
- icon: TEXT - 图标
- status: TEXT NOT NULL DEFAULT 'actived' - 状态: 'actived', 'deleted' 等
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP - 创建时间
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP - 更新时间

#### 评论表 (reviews)
- id: INTEGER PRIMARY KEY AUTOINCREMENT - 自增主键
- suid: TEXT NOT NULL - 站点uid，外键关联sites表
- token: TEXT NOT NULL - 授权令牌
- content: TEXT - Markdown 格式的点评内容
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP - 创建时间
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP - 更新时间

### 索引

### 规划中，暂不实现

#### 收藏夹表 (favorites)
- id: INTEGER PRIMARY KEY AUTOINCREMENT - 自增主键
- name: TEXT NOT NULL - 收藏夹名称
- slug: TEXT - 别名
- token: TEXT NOT NULL - 授权令牌
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP - 创建时间
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP - 更新时间

#### 收藏关联表 (favorite_relations)
- id: INTEGER PRIMARY KEY AUTOINCREMENT - 自增主键
- favorite_id: INTEGER NOT NULL - 收藏夹id，外键关联favorites表
- suid: INTEGER NOT NULL - 站点uid，外键关联sites表
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP - 创建时间
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP - 更新时间
- unique (favorite_id, suid)
