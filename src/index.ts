/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// 站点数据接口
interface Site {
	id: number;
	suid: string;
	token: string;
	name: string;
	url: string;
	icon?: string;
	status: string;
	created_at: string;
	updated_at: string;
	review_count?: number;
}

// 评论数据接口
interface Review {
	id: number;
	suid: string;
	token: string;
	content: string;
	created_at: string;
	updated_at: string;
}

// 更新URL请求接口
interface UpdateUrlRequest {
	suid: string;
	url: string;
}

import { customAlphabet } from 'nanoid';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const pathname = url.pathname;

		// 处理静态资源请求
		if (pathname === '/' || pathname === '/index.html') {
			// 返回主页HTML
			return env.ASSETS.fetch(request);
		}

		// 处理后台管理页面
		if (pathname === '/admin.html') {
			return env.ASSETS.fetch(request);
		}
		
		// 处理开发调试页面
		if (pathname === '/dev.html') {
			return env.ASSETS.fetch(request);
		}
		
		// 处理密钥认证页面
		if (pathname === '/key-auth.html') {
			return env.ASSETS.fetch(request);
		}
		
		// 处理 favicon 请求
		if (pathname === '/favicon.ico') {
			return env.ASSETS.fetch(request);
		}
		
		// 处理收藏夹详情页面（通过fav-前缀访问）
		if (pathname.startsWith('/fav-')) {
			// 对于 /fav-收藏夹别名 路由，重写为 /fav.html?slug=收藏夹别名
			const favSlug = pathname.substring(5); // 移除 '/fav-' 前缀
			if (favSlug) {
				url.pathname = '/fav.html';
				url.searchParams.set('slug', favSlug);
				return env.ASSETS.fetch(new Request(url.toString(), request));
			}
		}

		// 对于其他静态资源，直接从ASSETS绑定获取
		if (pathname.startsWith('/css/') || pathname.startsWith('/js/') || pathname.startsWith('/assets/')) {
			return env.ASSETS.fetch(request);
		}

		// API路由
		if (pathname.startsWith('/api/')) {
			// 通过token获取站点
			if (pathname === '/api/sites/token' && request.method === 'GET') {
				// 验证token
				const authHeader = request.headers.get('Authorization');
				if (!authHeader || !authHeader.startsWith('Bearer ')) {
					return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' },
					});
				}
				const token = authHeader.substring(7);
				
				try {
					const { results } = await env.DB.prepare(
						`SELECT s.*, COUNT(r.id) as review_count 
						 FROM sites s 
						 LEFT JOIN reviews r ON s.suid = r.suid 
						 WHERE s.token = ?
						 GROUP BY s.id, s.suid, s.token, s.name, s.url, s.icon, s.status, s.created_at, s.updated_at
						 ORDER BY s.created_at DESC`
					)
						.bind(token)
						.all<Site & { review_count: number }>();
					
					return new Response(JSON.stringify(results), {
						headers: { 'Content-Type': 'application/json' },
					});
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}
			
			// 通过token获取评论
			if (pathname === '/api/reviews/token' && request.method === 'GET') {
				// 验证token
				const authHeader = request.headers.get('Authorization');
				if (!authHeader || !authHeader.startsWith('Bearer ')) {
					return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' },
					});
				}
				const token = authHeader.substring(7);
				
				try {
					const { results } = await env.DB.prepare(
						'SELECT * FROM reviews WHERE token = ? ORDER BY created_at DESC'
					)
						.bind(token)
						.all<Review>();
					
					return new Response(JSON.stringify(results), {
						headers: { 'Content-Type': 'application/json' },
					});
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}
			
			// 获取所有站点（包括已删除的）- 用于管理页面
			if (pathname === '/api/sites/all' && request.method === 'GET') {
				try {
					const { results } = await env.DB.prepare(
						`SELECT s.*, COUNT(r.id) as review_count 
						 FROM sites s 
						 LEFT JOIN reviews r ON s.suid = r.suid 
						 GROUP BY s.id, s.suid, s.token, s.name, s.url, s.icon, s.status, s.created_at, s.updated_at
						 ORDER BY s.created_at DESC`
					)
						.all<Site & { review_count: number }>();
					
					return new Response(JSON.stringify(results), {
						headers: { 'Content-Type': 'application/json' },
					});
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}
			
			// 获取所有评论（包括已删除站点的评论）- 用于管理页面
			if (pathname === '/api/reviews/all' && request.method === 'GET') {
				try {
					const { results } = await env.DB.prepare(
						'SELECT * FROM reviews ORDER BY created_at DESC'
					)
						.all<Review>();
					
					return new Response(JSON.stringify(results), {
						headers: { 'Content-Type': 'application/json' },
					});
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}
			
			// 通过SUID获取单个站点
			if (pathname.startsWith('/api/sites/') && request.method === 'GET') {
				const suid = pathname.substring(11); // 移除 '/api/sites/' 前缀
				
				try {
					const site = await env.DB.prepare(
						'SELECT * FROM sites WHERE suid = ?'
					)
						.bind(suid)
						.first<Site>();
					
					if (site) {
						return new Response(JSON.stringify(site), {
							headers: { 'Content-Type': 'application/json' },
						});
					} else {
						return new Response(JSON.stringify({ error: 'Site not found' }), {
							status: 404,
							headers: { 'Content-Type': 'application/json' },
						});
					}
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}
			
			// 更新站点通过SUID
			if (pathname.startsWith('/api/sites/') && request.method === 'PUT') {
				const suid = pathname.substring(11); // 移除 '/api/sites/' 前缀
				
				// 验证token
				const authHeader = request.headers.get('Authorization');
				if (!authHeader || !authHeader.startsWith('Bearer ')) {
					return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' },
					});
				}
				const token = authHeader.substring(7);

				try {
					const body = await request.json() as Partial<Site>;
					
					// 检查站点是否存在且属于该token
					const site = await env.DB.prepare(
						'SELECT id FROM sites WHERE suid = ? AND token = ?'
					)
						.bind(suid, token)
						.first();
					
					if (!site) {
						return new Response(JSON.stringify({ error: 'Site not found or unauthorized' }), {
							status: 404,
							headers: { 'Content-Type': 'application/json' },
						});
					}
					
					const result = await env.DB.prepare(
						'UPDATE sites SET name = ?, url = ?, icon = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE suid = ?'
					)
						.bind(body.name, body.url, body.icon || null, body.status, suid)
						.run();
					
					if (result.success) {
						const updatedSite = await env.DB.prepare(
							'SELECT * FROM sites WHERE suid = ?'
						)
							.bind(suid)
							.first<Site>();
						
						return new Response(JSON.stringify(updatedSite), {
							headers: { 'Content-Type': 'application/json' },
						});
					} else {
						return new Response(JSON.stringify({ error: 'Failed to update site' }), {
							status: 500,
							headers: { 'Content-Type': 'application/json' },
						});
					}
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}

			// 获取所有站点（仅活跃站点）
			if (pathname === '/api/sites' && request.method === 'GET') {
				try {
					const { results } = await env.DB.prepare(
						`SELECT s.*, COUNT(r.id) as review_count 
						 FROM sites s 
						 LEFT JOIN reviews r ON s.suid = r.suid 
						 WHERE s.status = ? 
						 GROUP BY s.id, s.suid, s.token, s.name, s.url, s.icon, s.status, s.created_at, s.updated_at
						 ORDER BY s.created_at DESC`
					)
						.bind('actived')
						.all<Site & { review_count: number }>();
					
					return new Response(JSON.stringify(results), {
						headers: { 'Content-Type': 'application/json' },
					});
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}

			// 获取站点的评论
			if (pathname === '/api/reviews' && request.method === 'GET') {
				const siteSuid = url.searchParams.get('suid');
				if (!siteSuid) {
					return new Response(JSON.stringify({ error: 'Missing suid parameter' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					});
				}

				try {
					// 首先检查站点是否存在且状态为actived
					const siteResult = await env.DB.prepare(
						'SELECT id FROM sites WHERE suid = ? AND status = ?'
					)
						.bind(siteSuid, 'actived')
						.first();
					
					if (!siteResult) {
						return new Response(JSON.stringify({ error: 'Site not found or not active' }), {
							status: 404,
							headers: { 'Content-Type': 'application/json' },
						});
					}
					
					// 获取评论
					const { results } = await env.DB.prepare(
						'SELECT * FROM reviews WHERE suid = ? ORDER BY created_at DESC'
					)
						.bind(siteSuid)
						.all<Review>();
					
					return new Response(JSON.stringify(results), {
						headers: { 'Content-Type': 'application/json' },
					});
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}

			// 添加站点
			if (pathname === '/api/sites' && request.method === 'POST') {
				// 验证token
				const authHeader = request.headers.get('Authorization');
				if (!authHeader || !authHeader.startsWith('Bearer ')) {
					return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' },
					});
				}
				const token = authHeader.substring(7);

				try {
					const body = await request.json() as Partial<Site>;
					
					// 生成suid，使用参考代码中的格式：navo- + 7位随机小写字母和数字
					const genNavoId = (len = 7) => 'navo-' + customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', len)();
					const suid = genNavoId(7);
					
					const result = await env.DB.prepare(
						'INSERT INTO sites (suid, token, name, url, icon) VALUES (?, ?, ?, ?, ?)'
					)
						.bind(suid, token, body.name, body.url, body.icon || null)
						.run();
					
					if (result.success) {
						const { results } = await env.DB.prepare(
							'SELECT * FROM sites WHERE suid = ?'
						)
							.bind(suid)
							.all<Site>();
						
						return new Response(JSON.stringify(results[0]), {
							headers: { 'Content-Type': 'application/json' },
						});
					} else {
						return new Response(JSON.stringify({ error: 'Failed to create site' }), {
							status: 500,
							headers: { 'Content-Type': 'application/json' },
						});
					}
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}

			// 修改站点
			if (pathname.startsWith('/api/sites/') && request.method === 'PUT') {
				const suid = pathname.substring(11); // 移除 '/api/sites/' 前缀
				
				// 验证token
				const authHeader = request.headers.get('Authorization');
				if (!authHeader || !authHeader.startsWith('Bearer ')) {
					return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' },
					});
				}
				const token = authHeader.substring(7);

				try {
					const body = await request.json() as Partial<Site>;
					
					const result = await env.DB.prepare(
						'UPDATE sites SET name = ?, url = ?, icon = ?, updated_at = CURRENT_TIMESTAMP WHERE suid = ? AND token = ?'
					)
						.bind(body.name, body.url, body.icon || null, suid, token)
						.run();
					
					if (result.success) {
						const { results } = await env.DB.prepare(
							'SELECT * FROM sites WHERE suid = ?'
						)
							.bind(suid)
							.all<Site>();
						
						if (results.length > 0) {
							return new Response(JSON.stringify(results[0]), {
								headers: { 'Content-Type': 'application/json' },
							});
						} else {
							return new Response(JSON.stringify({ error: 'Site not found' }), {
								status: 404,
								headers: { 'Content-Type': 'application/json' },
							});
						}
					} else {
						return new Response(JSON.stringify({ error: 'Failed to update site' }), {
							status: 500,
							headers: { 'Content-Type': 'application/json' },
						});
					}
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}

			// 删除站点（逻辑删除，将status改为deleted）
			if (pathname.startsWith('/api/sites/') && request.method === 'DELETE') {
				const suid = pathname.substring(11); // 移除 '/api/sites/' 前缀
				
				// 验证token
				const authHeader = request.headers.get('Authorization');
				if (!authHeader || !authHeader.startsWith('Bearer ')) {
					return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' },
					});
				}
				const token = authHeader.substring(7);

				try {
					// 检查站点是否存在且属于该token
					const site = await env.DB.prepare(
						'SELECT id FROM sites WHERE suid = ? AND token = ?'
					)
						.bind(suid, token)
						.first();
					
					if (!site) {
						return new Response(JSON.stringify({ error: 'Site not found or unauthorized' }), {
							status: 404,
							headers: { 'Content-Type': 'application/json' },
						});
					}
					
					// 更新站点状态为deleted
					const result = await env.DB.prepare(
						'UPDATE sites SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE suid = ? AND token = ?'
					)
						.bind('deleted', suid, token)
						.run();
					
					if (result.success) {
						return new Response(JSON.stringify({ message: 'Site deleted successfully' }), {
							headers: { 'Content-Type': 'application/json' },
						});
					} else {
						return new Response(JSON.stringify({ error: 'Failed to delete site' }), {
							status: 500,
							headers: { 'Content-Type': 'application/json' },
						});
					}
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}

			// 添加评论
			if (pathname === '/api/reviews' && request.method === 'POST') {
				// 验证token
				const authHeader = request.headers.get('Authorization');
				if (!authHeader || !authHeader.startsWith('Bearer ')) {
					return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' },
					});
				}
				const token = authHeader.substring(7);

				try {
					const body = await request.json() as Partial<Review>;
					
					const result = await env.DB.prepare(
						'INSERT INTO reviews (suid, token, content) VALUES (?, ?, ?)'
					)
						.bind(body.suid, token, body.content)
						.run();
					
					if (result.success) {
						// 获取插入的评论
						const { results } = await env.DB.prepare(
							'SELECT * FROM reviews WHERE id = ?'
						)
							.bind(result.meta.last_row_id)
							.all<Review>();
						
						return new Response(JSON.stringify(results[0]), {
							headers: { 'Content-Type': 'application/json' },
						});
					} else {
						return new Response(JSON.stringify({ error: 'Failed to create review' }), {
							status: 500,
							headers: { 'Content-Type': 'application/json' },
						});
					}
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}

			// 修改评论
			if (pathname.startsWith('/api/reviews/') && request.method === 'PUT') {
				const idStr = pathname.substring(13); // 移除 '/api/reviews/' 前缀
				const id = parseInt(idStr);
				
				if (isNaN(id)) {
					return new Response(JSON.stringify({ error: 'Invalid review ID' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					});
				}

				// 验证token
				const authHeader = request.headers.get('Authorization');
				if (!authHeader || !authHeader.startsWith('Bearer ')) {
					return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' },
					});
				}
				const token = authHeader.substring(7);

				try {
					const body = await request.json() as Partial<Review>;
					
					const result = await env.DB.prepare(
						'UPDATE reviews SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND token = ?'
					)
						.bind(body.content, id, token)
						.run();
					
					if (result.success) {
						const { results } = await env.DB.prepare(
							'SELECT * FROM reviews WHERE id = ?'
						)
							.bind(id)
							.all<Review>();
						
						if (results.length > 0) {
							return new Response(JSON.stringify(results[0]), {
								headers: { 'Content-Type': 'application/json' },
							});
						} else {
							return new Response(JSON.stringify({ error: 'Review not found' }), {
								status: 404,
								headers: { 'Content-Type': 'application/json' },
							});
						}
					} else {
						return new Response(JSON.stringify({ error: 'Failed to update review' }), {
							status: 500,
							headers: { 'Content-Type': 'application/json' },
						});
					}
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}

			// 删除评论
			if (pathname.startsWith('/api/reviews/') && request.method === 'DELETE') {
				const idStr = pathname.substring(13); // 移除 '/api/reviews/' 前缀
				const id = parseInt(idStr);
				
				if (isNaN(id)) {
					return new Response(JSON.stringify({ error: 'Invalid review ID' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					});
				}

				// 验证token
				const authHeader = request.headers.get('Authorization');
				if (!authHeader || !authHeader.startsWith('Bearer ')) {
					return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' },
					});
				}
				const token = authHeader.substring(7);

				try {
					const result = await env.DB.prepare(
						'DELETE FROM reviews WHERE id = ? AND token = ?'
					)
						.bind(id, token)
						.run();
					
					if (result.success) {
						return new Response(JSON.stringify({ message: 'Review deleted successfully' }), {
							headers: { 'Content-Type': 'application/json' },
						});
					} else {
						return new Response(JSON.stringify({ error: 'Failed to delete review' }), {
							status: 500,
							headers: { 'Content-Type': 'application/json' },
						});
					}
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}

			// 更新URL接口 - 外部接口
			if (pathname === '/api/update/url' && request.method === 'POST') {
				// 验证token
				const authHeader = request.headers.get('Authorization');
				if (!authHeader || !authHeader.startsWith('Bearer ')) {
					return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' },
					});
				}
				const token = authHeader.substring(7);

				try {
					const body = await request.json() as UpdateUrlRequest[];
					
					// 存储每个更新操作的结果
					const updateResults: { suid: string; success: boolean; error?: string }[] = [];
					
					// 逐个处理更新操作
					for (const item of body) {
						try {
							// 检查站点是否存在
							const site = await env.DB.prepare(
								'SELECT id FROM sites WHERE suid = ?'
							)
							.bind(item.suid)
							.first<{ id: number }>();
							
							if (!site) {
								updateResults.push({
									suid: item.suid,
									success: false,
									error: 'Site not found'
								});
								continue;
							}
							
							// 尝试更新站点URL和updated_at字段
							const result = await env.DB.prepare(
								'UPDATE sites SET url = ?, updated_at = CURRENT_TIMESTAMP WHERE suid = ? AND token = ?'
							)
							.bind(item.url, item.suid, token)
							.run();
							
							if (result.success) {
								updateResults.push({
									suid: item.suid,
									success: true
								});
							} else {
								updateResults.push({
									suid: item.suid,
									success: false,
									error: 'Failed to update site'
								});
							}
						} catch (e: any) {
							updateResults.push({
								suid: item.suid,
								success: false,
								error: e.message
							});
						}
					}
					
					// 检查是否所有更新都成功
					const allSuccess = updateResults.every(result => result.success);
					
					if (allSuccess) {
						return new Response(JSON.stringify({ message: 'success' }), {
							headers: { 'Content-Type': 'application/json' },
						});
					} else {
						return new Response(JSON.stringify(updateResults), {
							status: 200, // 即使有些失败也返回200状态码，因为这是预期的行为
							headers: { 'Content-Type': 'application/json' },
						});
					}
				} catch (e: any) {
					return new Response(JSON.stringify({ error: e.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}

			// 默认API返回404
			return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 默认返回404
		return new Response('Not Found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;