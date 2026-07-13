import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

/**
 * Configuration interface for the reusable proxy module.
 */
export interface RestApiProxyConfig {
	/** Your API HOST URL (e.g. 'https://api.example.com') */
	host: string;
	/** Optional flag to append a trailing slash to the path */
    appendSlash?: boolean; 
	/** Optional array of allowed path prefixes to restrict access to downstream paths. Example: v1/products */
	allowedPaths?: string[];
	/** Optional extra headers to forward from the request */
	safeRequestHeaders?: string[];
	/** Optional extra headers to forward in the response */
	safeResponseHeaders?: string[];
	/** Optional function to extract token from session */
	extractToken?: (locals: App.Locals) => string | undefined;
	/** Optional path to prepend to the proxied path */
	prependPath?: string;
	/** Optional flag to enable debug logging */
	debug?: boolean;
	/** Optional retry config for transient upstream failures. Applies to idempotent methods (GET by default). */
	retry?: {
		/** Total number of attempts (including the first). Defaults to 1 (no retry). */
		attempts?: number;
		/** Upstream status codes that trigger a retry. Defaults to [502, 503, 504]. */
		statuses?: number[];
		/** Base delay in ms between attempts; grows exponentially. Defaults to 200. */
		backoffMs?: number;
		/** Methods eligible for retry. Defaults to ['GET']. */
		methods?: string[];
	};
}


export const defaultRequestHeaders = ['authorization', 'content-type', 'accept', 'accept-language', 'cookie', 'x-csrftoken', 'referer', 'user-agent', 'x-requested-with'];
export const defaultResponseHeaders = ['content-type', 'cache-control', 'etag'];
// fetch() transparently decompresses gzip/br upstream bodies but leaves the
// upstream's Content-Encoding and (compressed) Content-Length in the response
// headers. Re-serving those with the decoded body truncates or corrupts the
// response in the browser, so they must never be forwarded — the runtime
// recomputes framing for the proxied Response.
const strippedResponseHeaders = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'];

/**
 * Creates a set of SvelteKit request handlers for proxying API calls securely.
 */
export function createProxyHandlers(config: RestApiProxyConfig): Record<string, RequestHandler> {
	
	if(config.debug) console.debug("API Proxy: Creating proxy handlers with config:", config);

	async function handler(event: Parameters<RequestHandler>[0]): Promise<Response> {
		const path = (event.params as Record<string, string | undefined>)['path'];
		const queryString = event.url.searchParams.toString();
		const slash = config.appendSlash ? '/' : '';
		const prepend = config.prependPath ? `/${config.prependPath}/` : '/';
        const fullPath = `${prepend}${path}${slash}${queryString ? `?${queryString}` : ''}`;
		if(config.debug) console.debug("API Proxy: Full Path:", fullPath);
		const url = `${config.host}${fullPath}`;

		if(config.debug) console.debug(`API Proxy: Proxying ${event.request.method} request to: ${url}`);

		// Validate the path against allowed prefixes if specified
		if(config.allowedPaths && config.allowedPaths.length > 0){
			const isAllowed = config.allowedPaths.some((prefix) => path?.startsWith(prefix));
			if (!isAllowed) throw error(403, 'Forbidden: This proxy API path is not allowed.');
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

		const retryStatuses = config.retry?.statuses ?? [502, 503, 504];
		const retryMethods = config.retry?.methods ?? ['GET'];
		const maxAttempts = Math.max(1, config.retry?.attempts ?? 1);
		const baseDelay = config.retry?.backoffMs ?? 200;
		const canRetry = retryMethods.includes(event.request.method);

		// Buffer the body once so it can be safely re-sent across retries.
		const body = event.request.method !== 'GET' && event.request.method !== 'HEAD'
			? await event.request.clone().arrayBuffer()
			: undefined;

		let proxyResponse: Response;
		let attempt = 0;
		while (true) {
			attempt++;
			try {
				proxyResponse = await fetch(url, { method: event.request.method, headers, body });
			} catch (err) {
				// Network-level failure (connection reset, DNS, etc.) — treat as transient.
				if (canRetry && attempt < maxAttempts) {
					if (config.debug) console.debug(`API Proxy: retry ${attempt}/${maxAttempts} after network error:`, err);
					await new Promise((resolve) => setTimeout(resolve, baseDelay * 2 ** (attempt - 1)));
					continue;
				}
				throw err;
			}

			const shouldRetry = canRetry && attempt < maxAttempts && retryStatuses.includes(proxyResponse.status);
			if (!shouldRetry) break;

			// Discard the failed response body so the connection can be reused.
			await proxyResponse.body?.cancel();

			if (config.debug) console.debug(`API Proxy: retry ${attempt}/${maxAttempts} after status ${proxyResponse.status}`);
			await new Promise((resolve) => setTimeout(resolve, baseDelay * 2 ** (attempt - 1)));
		}

		const allowedHeaders = config.safeResponseHeaders && config.safeResponseHeaders.length > 0 ? config.safeResponseHeaders : null;
		const responseHeaders = new Headers();
		for (const [key, value] of proxyResponse.headers) {
			const lowerKey = key.toLowerCase();
			if (strippedResponseHeaders.includes(lowerKey)) continue;
			if (allowedHeaders && !allowedHeaders.includes(lowerKey)) continue;
			if (value != null) responseHeaders.set(key, value);
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
