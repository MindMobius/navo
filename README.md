# Navo

> 一个以"用户评价"为核心的轻量级导航站

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/)
[![Hono](https://img.shields.io/badge/Hono-Framework-red)](https://hono.dev/)

Navo 是一个基于 Cloudflare Workers 和 Hono 框架构建的轻量级网站导航系统，专注于通过用户评价来发现和分享有价值的网站。

- **后端框架** - Cloudflare Workers + Hono
- **数据库** - Cloudflare D1 SQLite 数据库
- **前端界面** - 原生 HTML/CSS/JavaScript + Mustache 模板引擎实现
- **部署方式** - 一键部署到 Cloudflare 平台

## 功能特性

- **站点记录** - 记录网站链接，并添加评价说明该网站的用途和价值
- **关键词搜索** - 通过关键词快速搜索相关网站和评价
- **动态更新** - 支持通过 API 端点实时更新网站链接
- **权限管理** - 基于 Token 的简单权限验证机制


## 快速开始

### 1. 访问网站

直接访问网站首页，通过评论和关键词搜索找到需要的网站

### 2. 管理权限设置

Navo 采用无用户表设计，通过创建访问密钥进行管理操作：

1. 访问密钥认证页面
2. 输入或生成访问密钥
3. 开始管理网站和评价

### 3. 管理网站内容

访问管理中心可以进行以下操作：
- 添加/编辑网站信息
- 添加/管理网站评价

### 4. API 动态更新

支持通过 API 端点动态更新网站链接：

#### 使用场景示例：Lucky STUN 内网穿透 Webhook

当使用 Lucky STUN 内网穿透时，可以配置 Webhook 自动更新网站地址：

- 接口地址：
```
https://your-domain.com/api/update/url
```
- 请求方法：POST
- 请求头：
```
{
  "Content-Type": "application/json",
  "Authorization": "Bearer navo-token"
}
```
- 请求体：
```
[
  {
    "suid": "nano-suid1",
    "url": "#{ipAddr}"
  },
  {
    "suid": "nano-suid2",
    "url": "https://emby.your-domain.com:#{port}"
  },
  {
    "suid": "nano-suid3",
    "url": "https://openlist.your-domain.com:#{port}"
  }
]
```
- 接口调用成功返回的字符串:
```
{"message":"success"}
```

## 部署指南

1. 克隆项目代码
2. 安装依赖：`npm install`
3. 配置 Cloudflare 环境：`wrangler login`
4. 创建数据库：`wrangler d1 create navo-db`
5. 将数据库的的ID填入 wrangler.toml 文件的database_id中，注意binding名称必须为DB
```
	"d1_databases": [
		{
			"binding": "DB",
			"database_name": "navo-db",
			"database_id": "your-database-id"
		}
	],
```
5. 将数据表创建到数据库：`wrangler d1 execute navo-db --file=./migrations/0001_create_sites_table.sql --remote`
4. 部署到 Cloudflare：`npm run deploy`

### 本地调试
1. 创建本体数据库  `npx wrangler d1 create navo-db --local`
2. 将数据表创建到数据库：`npx wrangler d1 execute navo-db --file=./migrations/0001_create_sites_table.sql --local`
3. 启动本地开发服务器：`npx wrangler dev --env dev `
