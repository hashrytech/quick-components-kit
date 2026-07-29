import { afterEach, describe, expect, it, vi } from 'vitest';
import { FetchClient } from '../lib/modules/fetch-client.js';

afterEach(() => {
	vi.restoreAllMocks();
});

type Deferred<T> = {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (reason?: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return { promise, resolve, reject };
}

describe('FetchClient request state', () => {
	it('tracks loading state for a single request', async () => {
		const deferred = createDeferred<Response>();
		const fetchMock = vi.fn().mockReturnValue(deferred.promise);
		const client = new FetchClient({ baseURL: 'https://api.example.com' });

		client.setFetchInstance(fetchMock as unknown as typeof fetch);

		const requestPromise = client.get<{ ok: boolean }>('/health');

		expect(client.requestsInProgress).toBe(true);
		expect(client.activeRequestCount).toBe(1);

		deferred.resolve(
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);

		const result = await requestPromise;
		expect(result.ok).toBe(true);
		expect(client.requestsInProgress).toBe(false);
		expect(client.activeRequestCount).toBe(0);
	});

	it('tracks active count across concurrent requests', async () => {
		const first = createDeferred<Response>();
		const second = createDeferred<Response>();
		const fetchMock = vi
			.fn()
			.mockReturnValueOnce(first.promise)
			.mockReturnValueOnce(second.promise);
		const client = new FetchClient({ baseURL: 'https://api.example.com' });

		client.setFetchInstance(fetchMock as unknown as typeof fetch);

		const firstRequest = client.get<{ id: number }>('/first');
		const secondRequest = client.get<{ id: number }>('/second');

		expect(client.requestsInProgress).toBe(true);
		expect(client.activeRequestCount).toBe(2);

		first.resolve(
			new Response(JSON.stringify({ id: 1 }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		await firstRequest;
		expect(client.requestsInProgress).toBe(true);
		expect(client.activeRequestCount).toBe(1);

		second.resolve(
			new Response(JSON.stringify({ id: 2 }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		await secondRequest;
		expect(client.requestsInProgress).toBe(false);
		expect(client.activeRequestCount).toBe(0);
	});

	it('clears loading state when fetch fails', async () => {
		const deferred = createDeferred<Response>();
		const fetchMock = vi.fn().mockReturnValue(deferred.promise);
		const client = new FetchClient({ baseURL: 'https://api.example.com' });

		client.setFetchInstance(fetchMock as unknown as typeof fetch);

		const requestPromise = client.get('/fail');
		expect(client.requestsInProgress).toBe(true);
		expect(client.activeRequestCount).toBe(1);

		deferred.reject(new Error('network down'));

		const result = await requestPromise;
		expect(result.ok).toBe(false);
		expect(result.status).toBe(503);
		expect(client.requestsInProgress).toBe(false);
		expect(client.activeRequestCount).toBe(0);
	});
});

describe('FetchClient error responses', () => {
	function clientReturning(response: Response): FetchClient {
		const client = new FetchClient({ baseURL: 'https://api.example.com' });
		client.setFetchInstance(vi.fn().mockResolvedValue(response) as unknown as typeof fetch);
		return client;
	}

	it('preserves RFC 7807 problem details', async () => {
		const problem = {
			type: '/exceptions/validation-error/',
			title: 'Validation error',
			status: 400,
			detail: 'The request was invalid.',
			email: ['Enter a valid email address.']
		};
		const client = clientReturning(
			new Response(JSON.stringify(problem), {
				status: 400,
				statusText: 'Bad Request',
				headers: { 'Content-Type': 'application/problem+json; charset=utf-8' }
			})
		);

		const result = await client.get('/problem');

		expect(result).toEqual({ ok: false, status: 400, error: problem });
	});

	it.each([
		[{ message: 'Legacy message' }, 'Legacy message'],
		[{ error: 'Legacy error' }, 'Legacy error']
	])('uses a message from a legacy JSON error body', async (body, detail) => {
		const client = clientReturning(
			new Response(JSON.stringify(body), {
				status: 400,
				statusText: 'Bad Request',
				headers: { 'Content-Type': 'application/json' }
			})
		);

		const result = await client.get('/legacy-error');

		expect(result.ok).toBe(false);
		expect(result.status).toBe(400);
		expect(result.error?.detail).toBe(detail);
	});

	it('normalizes a plain-text gateway timeout without logging a parse warning', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const client = clientReturning(
			new Response('upstream request timeout', {
				status: 504,
				statusText: 'Gateway Timeout',
				headers: { 'Content-Type': 'text/plain; charset=utf-8' }
			})
		);

		const result = await client.get('/slow');

		expect(result).toEqual({
			ok: false,
			status: 504,
			error: {
				status: 504,
				title: 'Gateway Timeout',
				detail: 'upstream request timeout',
				type: '/exceptions/fetch-error/'
			}
		});
		expect(warn).not.toHaveBeenCalled();
	});

	it('falls back to statusText for an empty error body', async () => {
		const client = clientReturning(
			new Response(null, {
				status: 502,
				statusText: 'Bad Gateway'
			})
		);

		const result = await client.get('/empty-error');

		expect(result.status).toBe(502);
		expect(result.error?.title).toBe('Bad Gateway');
		expect(result.error?.detail).toBe('Bad Gateway');
	});

	it('does not expose an HTML proxy error page', async () => {
		const client = clientReturning(
			new Response('<html><body>private proxy diagnostics</body></html>', {
				status: 502,
				statusText: 'Bad Gateway',
				headers: { 'Content-Type': 'text/html; charset=utf-8' }
			})
		);

		const result = await client.get('/html-error');

		expect(result.status).toBe(502);
		expect(result.error?.detail).toBe('Bad Gateway');
		expect(result.error?.detail).not.toContain('private proxy diagnostics');
	});

	it('handles malformed JSON without logging a parse warning or losing the status', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const client = clientReturning(
			new Response('{detail:', {
				status: 504,
				statusText: 'Gateway Timeout',
				headers: { 'Content-Type': 'application/problem+json' }
			})
		);

		const result = await client.get('/malformed-error');

		expect(result.status).toBe(504);
		expect(result.error?.detail).toBe('Gateway Timeout');
		expect(warn).not.toHaveBeenCalled();
	});
});
