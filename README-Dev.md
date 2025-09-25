## 接口

- 获取 站点
- 获取 站点 评论
- 通过 token 增加站点
- 通过 suid + token 修改站点
- 通过 suid + token 增加评论
- 通过 评论表id + token 修改评论
- 通过 评论表id + token 删除评论

### 外部接口
- 接口地址：
```
/api/update/url
```
- 请求方法：POST
- 请求头：
```
Authorization: Bearer [YOUR_TOKEN]
```
- 请求体：
```
[
  {
    "suid": "site-uid-1",
    "url": "#{ipAddr}"
  },
  {
    "suid": "site-uid-2",
    "url": "https://emby.your-domain.com:#{port}"
  },
  {
    "suid": "site-uid-3",
    "url": "https://openlist.your-domain.com:#{port}"
  }
]
```
- 接口调用成功包含的字符串:
```
"success"
```

## 生成规则

### token 密钥
固定长度密钥的函数，总长度为51个字符 (navo- + 46个小写字母)

### suid 站点uid
navo- + 7位随机小写字母和数字
```
import { customAlphabet } from 'nanoid';
const genNavoId = (len = 7) => 'navo-' + customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', len)();
console.log(genNavoId(7)); // navo-m2k9xq3
```

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

## 规划中，暂不实现

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
