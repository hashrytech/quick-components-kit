import type { RequestHandler } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProxyHandlers, type RestApiProxyConfig } from './api-proxy.js';

type Outcome = { status: number } | { error: unknown };

type TrackedResponse = { response: Response; cancel: ReturnType<typeof vi.fn> } | null;

/**
 * Builds a mocked global `fetch` that yields the given outcomes in order.
 * Status outcomes produce a minimal Response-like object whose body `cancel`
 * is tracked so tests can assert discarded responses are released.
 */
function mockFetch(outcomes: Outcome[]): { fetchMock: ReturnType<typeof vi.fn>; responses: TrackedResponse[] } {
	const fetchMock = vi.fn();
	const responses: TrackedResponse[] = [];

	for (const outcome of outcomes) {
		if ('error' in outcome) {
			fetchMock.mockRejectedValueOnce(outcome.error);
			responses.push(null);
		} else {
			const cancel = vi.fn().mockResolvedValue(undefined);
			const response = {
				status: outcome.status,
				headers: new Headers(),
				body: { cancel }
			} as unknown as Response;
			fetchMock.mockResolvedValueOnce(response);
			responses.push({ response, cancel });
		}
	}

	return { fetchMock, responses };
}

function createEvent(
	method: string,
	{ path = 'v1/products', query = '', body }: { path?: string; query?: string; body?: BodyInit } = {}
): Parameters<RequestHandler>[0] {
	const url = new URL(`https://proxy.local/${path}${query ? `?${query}` : ''}`);
	const request = new Request(url, {
		method,
		headers: { 'content-type': 'application/json' },
		body: method !== 'GET' && method !== 'HEAD' ? body : undefined
	});

	return {
		params: { path },
		url,
		request,
		locals: {} as App.Locals
	} as unknown as Parameters<RequestHandler>[0];
}

const baseConfig: RestApiProxyConfig = { host: 'https://api.example.com' };

describe('createProxyHandlers retry behavior', () => {
	beforeEach(() => {
		vi.useRealTimers();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('retries a GET on a transient status and returns the eventual success', async () => {
		const { fetchMock, responses } = mockFetch([{ status: 503 }, { status: 200 }]);
		vi.stubGlobal('fetch', fetchMock);

		const handlers = createProxyHandlers({ ...baseConfig, retry: { attempts: 3, backoffMs: 0 } });
		const res = await handlers.GET!(createEvent('GET'));

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(res.status).toBe(200);
		// The failed response body must be released before retrying.
		expect(responses[0]?.cancel).toHaveBeenCalledTimes(1);
	});

	it('stops after attempts are exhausted and returns the last failing response', async () => {
		const { fetchMock, responses } = mockFetch([{ status: 502 }, { status: 503 }, { status: 504 }]);
		vi.stubGlobal('fetch', fetchMock);

		const handlers = createProxyHandlers({ ...baseConfig, retry: { attempts: 3, backoffMs: 0 } });
		const res = await handlers.GET!(createEvent('GET'));

		expect(fetchMock).toHaveBeenCalledTimes(3);
		expect(res.status).toBe(504);
		// Discarded responses are cancelled; the final returned one is not.
		expect(responses[0]?.cancel).toHaveBeenCalledTimes(1);
		expect(responses[1]?.cancel).toHaveBeenCalledTimes(1);
		expect(responses[2]?.cancel).not.toHaveBeenCalled();
	});

	it('does not retry a status outside the retry set', async () => {
		const { fetchMock } = mockFetch([{ status: 500 }]);
		vi.stubGlobal('fetch', fetchMock);

		const handlers = createProxyHandlers({ ...baseConfig, retry: { attempts: 3, backoffMs: 0 } });
		const res = await handlers.GET!(createEvent('GET'));

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(res.status).toBe(500);
	});

	it('does not retry non-GET methods by default', async () => {
		const { fetchMock } = mockFetch([{ status: 503 }]);
		vi.stubGlobal('fetch', fetchMock);

		const handlers = createProxyHandlers({ ...baseConfig, retry: { attempts: 3, backoffMs: 0 } });
		const res = await handlers.POST!(createEvent('POST', { body: JSON.stringify({ a: 1 }) }));

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(res.status).toBe(503);
	});

	it('makes a single attempt when no retry config is provided', async () => {
		const { fetchMock } = mockFetch([{ status: 503 }]);
		vi.stubGlobal('fetch', fetchMock);

		const handlers = createProxyHandlers(baseConfig);
		const res = await handlers.GET!(createEvent('GET'));

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(res.status).toBe(503);
	});

	it('retries a GET on a thrown network error and recovers', async () => {
		const { fetchMock } = mockFetch([{ error: new Error('ECONNRESET') }, { status: 200 }]);
		vi.stubGlobal('fetch', fetchMock);

		const handlers = createProxyHandlers({ ...baseConfig, retry: { attempts: 3, backoffMs: 0 } });
		const res = await handlers.GET!(createEvent('GET'));

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(res.status).toBe(200);
	});

	it('rethrows when network errors exhaust all attempts', async () => {
		const { fetchMock } = mockFetch([{ error: new Error('down') }, { error: new Error('down') }]);
		vi.stubGlobal('fetch', fetchMock);

		const handlers = createProxyHandlers({ ...baseConfig, retry: { attempts: 2, backoffMs: 0 } });

		await expect(handlers.GET!(createEvent('GET'))).rejects.toThrow('down');
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('honors custom statuses and methods', async () => {
		const { fetchMock } = mockFetch([{ status: 500 }, { status: 200 }]);
		vi.stubGlobal('fetch', fetchMock);

		const handlers = createProxyHandlers({
			...baseConfig,
			retry: { attempts: 3, backoffMs: 0, statuses: [500], methods: ['POST'] }
		});
		const res = await handlers.POST!(createEvent('POST', { body: JSON.stringify({ a: 1 }) }));

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(res.status).toBe(200);
	});
});
