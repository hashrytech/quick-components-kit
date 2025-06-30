import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

/**
 * Configuration interface for the reusable proxy module.
 */
export interface RestApiProxyConfig {
	/** Your API HOST URL (e.g. 'https://api.example.com') */
	host: string;
	/** Optional array of allowed path prefixes to restrict access to downstream paths. Example: v1/products */
	allowedPaths?: string[];
	/** Optional extra headers to forward from the request */
	safeRequestHeaders?: string[];
	/** Optional extra headers to forward in the response */
	safeResponseHeaders?: string[];
	/** Optional function to extract token from session */
	extractToken?: (locals: App.Locals) => string | undefined;
}


export const defaultRequestHeaders = ['authorization', 'content-type', 'accept', 'accept-language', 'cookie', 'x-csrftoken', 'referer', 'user-agent', 'x-requested-with'];
export const defaultResponseHeaders = ['content-type', 'content-length', 'cache-control', 'etag'];

/**
 * Creates a set of SvelteKit request handlers for proxying API calls securely.
 */
export function createProxyHandlers(config: RestApiProxyConfig): Record<string, RequestHandler> {

	async function handler(event: Parameters<RequestHandler>[0]): Promise<Response> {
		const path = event.params.path;
		const queryString = event.url.searchParams.toString();
		const fullPath = `/${path}${queryString ? `?${queryString}` : ''}`;
		const url = `${config.host}${fullPath}`;

		// Validate the path against allowed prefixes if specified
		if(config.allowedPaths && config.allowedPaths.length > 0){
			const isAllowed = config.allowedPaths.some((prefix) => path?.startsWith(prefix));
			if (!isAllowed) throw error(403, 'Forbidden: This API path is not allowed.');
		}

		let headers = new Headers(event.request.headers);
		if(config.safeRequestHeaders && config.safeRequestHeaders.length > 0) {
            headers = new Headers();
			for (const [key, value] of event.request.headers) {
				if (defaultRequestHeaders.includes(key.toLowerCase()) && value != null) {
					headers.set(key, value);
				}
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
		
		if(config.safeResponseHeaders && config.safeResponseHeaders.length > 0) {
			const responseHeaders = new Headers();
			for (const [key, value] of proxyResponse.headers) {
				if (config.safeResponseHeaders.includes(key.toLowerCase()) && value != null) {
					responseHeaders.set(key, value);
				}
			}

			return new Response(proxyResponse.body, {
				status: proxyResponse.status,
				headers: responseHeaders
			});
		}
		else{
			return proxyResponse;
		}
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
