import { describe, expect, it } from 'vitest';
import { FetchClient } from './fetch-client.js';

/** A client whose fetch captures the outgoing Request instead of sending it. */
function captureClient() {
	const client = new FetchClient({ baseURL: 'https://api.test' });
	let captured: Request | undefined;
	client.setFetchInstance((async (input: RequestInfo | URL) => {
		captured = input as Request;
		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	}) as typeof fetch);
	return { client, request: () => captured! };
}

describe('FetchClient request building', () => {
	it('keeps the default Content-Type when custom headers are passed', async () => {
		const { client, request } = captureClient();

		await client.post('/refunds', { amount: '5.00' }, { headers: { 'Idempotency-Key': 'key-1' } });

		const sent = request();
		expect(sent.headers.get('Idempotency-Key')).toBe('key-1');
		// The regression this pins: `options` used to be spread AFTER the
		// merged headers when constructing the Request, so a custom `headers`
		// object REPLACED the defaults wholesale — the JSON body went up as
		// text/plain and JSON APIs refused it with 415.
		expect(sent.headers.get('Content-Type')).toContain('application/json');
		expect(await sent.json()).toEqual({ amount: '5.00' });
	});

	it('keeps the Authorization header when custom headers are passed', async () => {
		const { client, request } = captureClient();
		client.setAccessToken('token-1');

		await client.post('/refunds', { amount: '5.00' }, { headers: { 'Idempotency-Key': 'key-1' } });

		expect(request().headers.get('Authorization')).toBe('Bearer token-1');
	});

	it('overrides defaults key-for-key, not wholesale', async () => {
		const { client, request } = captureClient();

		await client.post('/things', { a: 1 }, { headers: { 'Content-Type': 'application/vnd.custom+json' } });

		expect(request().headers.get('Content-Type')).toBe('application/vnd.custom+json');
	});

	it('still drops Content-Type for FormData so the boundary can be set', async () => {
		const { client, request } = captureClient();
		const form = new FormData();
		form.append('field', 'value');

		await client.post('/upload', form, { headers: { 'Idempotency-Key': 'key-2' } });

		expect(request().headers.get('Content-Type') ?? '').not.toContain('application/json');
		expect(request().headers.get('Idempotency-Key')).toBe('key-2');
	});

	it('passes non-header fetch options through to the Request', async () => {
		const { client, request } = captureClient();

		await client.post('/things', { a: 1 }, { headers: { 'Idempotency-Key': 'k' }, cache: 'no-store' });

		expect(request().cache).toBe('no-store');
	});
});
