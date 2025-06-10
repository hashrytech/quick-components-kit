// src/modules/api/api-proxy.ts
import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

/**
 * Configuration interface for the reusable proxy module.
 */
export interface ApiProxyConfig {
	/** Your API base URL (e.g. 'https://api.example.com/v1') */
	baseURL: string;
	/** Allowed path prefixes for security */
	allowedPaths: string[];
	/** Optional extra headers to forward */
	extraRequestHeaders?: string[];
	/** Optional extra headers to return */
	extraResponseHeaders?: string[];
	/** Optional function to extract token from session */
	extractToken?: (locals: App.Locals) => string | undefined;
}

/**
 * Creates a set of SvelteKit request handlers for proxying API calls securely.
 */
export function createApiProxyHandlers(config: ApiProxyConfig): Record<string, RequestHandler> {
	const safeRequestHeaders = [
		'authorization', 'content-type', 'accept', 'accept-language',
		'cookie', 'x-csrftoken', 'referer', 'user-agent', 'x-requested-with',
		...(config.extraRequestHeaders ?? [])
	];

	const safeResponseHeaders = [
		'content-type', 'content-length', 'cache-control', 'etag',
		...(config.extraResponseHeaders ?? [])
	];

	async function handler(event: Parameters<RequestHandler>[0]): Promise<Response> {
		const path = event.params.path;
		const search = event.url.searchParams.toString();
		const fullPath = `/${path}${search ? `?${search}` : ''}`;

		const isAllowed = config.allowedPaths.some((prefix) => path?.startsWith(prefix));
		if (!isAllowed) throw error(403, 'Forbidden: This API path is not allowed.');

		const url = `${config.baseURL}${fullPath}`;

		const headers = new Headers();
		for (const [key, value] of event.request.headers) {
			if (safeRequestHeaders.includes(key.toLowerCase()) && value != null) {
				headers.set(key, value);
			}
		}

		const token = config.extractToken?.(event.locals);
		if (token) headers.set('Authorization', `Bearer ${token}`);

		const proxyResponse = await fetch(url, {
			method: event.request.method,
			headers,
			body: event.request.method !== 'GET' && event.request.method !== 'HEAD'
				? await event.request.clone().arrayBuffer()
				: undefined
		});

		const responseHeaders = new Headers();
		for (const [key, value] of proxyResponse.headers) {
			if (safeResponseHeaders.includes(key.toLowerCase()) && value != null) {
				responseHeaders.set(key, value);
			}
		}

		return new Response(proxyResponse.body, {
			status: proxyResponse.status,
			headers: responseHeaders
		});
	}

	return {
		GET: handler,
		POST: handler,
		PUT: handler,
		PATCH: handler,
		DELETE: handler,
		OPTIONS: handler
	};
}
