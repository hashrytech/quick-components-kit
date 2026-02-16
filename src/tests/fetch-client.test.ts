import { describe, expect, it, vi } from 'vitest';
import { FetchClient } from '../lib/modules/fetch-client.js';

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
