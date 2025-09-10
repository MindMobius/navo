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

export default {
	async fetch(request, env, ctx): Promise<Response> {
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

		// 对于其他静态资源，直接从ASSETS绑定获取
		if (pathname.startsWith('/css/') || pathname.startsWith('/js/') || pathname.startsWith('/assets/')) {
			return env.ASSETS.fetch(request);
		}

		// API路由示例
		if (pathname.startsWith('/api/')) {
			return new Response('API endpoint placeholder', {
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 默认返回404
		return new Response('Not Found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;