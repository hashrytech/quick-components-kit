// src/lib/api/client.ts

import { getProblemDetail, type ProblemDetail } from "./problem-details";

/**
 * @file This module defines a generic REST API client for SvelteKit applications.
 * It provides methods for standard HTTP operations (GET, POST, PUT, PATCH, DELETE),
 * supports authentication via Bearer tokens, includes customizable middleware hooks
 * for request and response processing, and handles file uploads and downloads.
 *
 * It's designed to be used with SvelteKit's `fetch` (which is global in load functions
 * and API routes) to automatically benefit from its enhancements (e.g., cookie forwarding,
 * built-in request/response interception via SvelteKit's `handleFetch` hook).
 */

export type ApiResponse<T> = {
    ok: boolean;
    status: number;
    data?: T;
    error?: ProblemDetail;
};

// Define configuration options for the API client
export interface ApiClientConfig {
    /** The base URL for your API (e.g., 'https://api.yourapi.com/v1'). */
    baseURL: string;
    /** Default headers to be sent with every request. */
    defaultHeaders?: HeadersInit;
    /** A function that returns the current access token. This is useful for client-side
     * operations where you might store the token in a Svelte store or similar.
     * For server-side operations using SvelteKit's `fetch`, the token is typically
     * handled by `src/hooks.server.ts` via `handleFetch`.
     */
    getAccessToken?: () => string | undefined;
}

// Define options for individual API requests
export interface RequestOptions extends RequestInit {
    /** If true, the Authorization header will not be added to this request. */
    skipAuth?: boolean;
    /** Specifies how the response body should be parsed.
     * 'json' (default): Parses as JSON.
     * 'text': Parses as plain text.
     * 'blob': Parses as a Blob (useful for file downloads).
     * 'arrayBuffer': Parses as an ArrayBuffer.
     * 'raw': Returns the raw Response object without parsing the body.
     */
    responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'raw';
    /**
     * The `fetch` function to use for making the request.
     * In SvelteKit:
     * - In `+page.server.ts`, `+layout.server.ts`, `+server.ts` it's the enhanced `fetch` passed to `load` functions/handlers.
     * - In `+page.svelte`, `+layout.svelte`, `+client.ts` it's the browser's global `fetch`.
     */
    fetchInstance?: typeof fetch;
}

// Define types for middleware hooks
export type RequestInterceptor = (request: Request) => Promise<Request> | Request;
export type ResponseInterceptor = (response: Response) => Promise<Response> | Response;
export type ErrorHandler = (error: Error) => Promise<void> | void;

/**
 * Custom error class for API responses.
 * Provides access to the HTTP status code.
 */
export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export interface ApiClientEvents {
	onRequest?: (request: Request) => void;
	onResponse?: (response: Response) => void;
	onError?: (error: Error) => void;
}


/**
 * A generic REST API client.
 *
 * Features:
 * - Configurable base URL and default headers.
 * - Supports GET, POST, PUT, PATCH, DELETE methods.
 * - Handles Bearer token authentication.
 * - Customizable request and response interceptors (middleware hooks).
 * - Centralized error handling.
 * - Supports file uploads (FormData).
 * - Supports file downloads (returns Blob).
 * - Integrates with SvelteKit's `fetch` for server-side benefits.
 */
export class ApiClient {
    private baseURL: string;
    private defaultHeaders: HeadersInit;
    // This token is primarily for explicit client-side setting if needed,
    // otherwise relies on getAccessTokenFromStore or SvelteKit's `handleFetch`.
    private clientAuthToken: string | undefined;
    private getAccessTokenFromStore: (() => string | undefined) | undefined;
    
    private requestInterceptors: RequestInterceptor[] = [];
    private responseInterceptors: ResponseInterceptor[] = [];
    private errorHandlers: ErrorHandler[] = [];
    private events: ApiClientEvents = {};

    /**
     * Creates an instance of ApiClient.
     * @param config - Configuration for the API client.
     */
    constructor(config: ApiClientConfig & { events?: ApiClientEvents }) {
        this.baseURL = config.baseURL;
        this.defaultHeaders = config.defaultHeaders || { 'Content-Type': 'application/json' };
        this.getAccessTokenFromStore = config.getAccessToken;
    }

    /**
     * Sets the Bearer token for client-side requests.
     * This will override `getAccessToken` for subsequent requests using this client instance.
     * @param token - The access token string, or undefined to clear it.
     */
    setAuthToken(token: string | undefined): void {
        this.clientAuthToken = token;
    }

    /**
     * Adds a request interceptor. Interceptors can modify the `Request` object before it's sent.
     * @param interceptor - A function that takes a `Request` object and returns a `Request` or a Promise resolving to a `Request`.
     */
    addRequestInterceptor(interceptor: RequestInterceptor): void {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * Adds a response interceptor. Interceptors can modify the `Response` object after it's received but before parsing.
     * Useful for global error handling (e.g., refreshing tokens on 401).
     * @param interceptor - A function that takes a `Response` object and returns a `Response` or a Promise resolving to a `Response`.
     */
    addResponseInterceptor(interceptor: ResponseInterceptor): void {
        this.responseInterceptors.push(interceptor);
    }

    /**
     * Adds a global error handler. These handlers are called when a request fails (network error or non-2xx API response).
     * @param handler - A function that takes an `Error` object.
     */
    addErrorHandler(handler: ErrorHandler): void {
        this.errorHandlers.push(handler);
    }

    setEventHooks(events: Partial<ApiClientEvents>) {
		Object.assign(this.events, events);
	}

    /**
     * Processes the request, applying default headers, auth token, and request interceptors.
     * @param endpoint - The API endpoint (e.g., '/products', '/users/123').
     * @param method - HTTP method (GET, POST, etc.).
     * @param body - The request body.
     * @param options - Additional request options.
     * @returns A processed `Request` object ready for `fetch`.
     */
    private async processRequest(endpoint: string, method: string, body: BodyInit | object | null | undefined, options: RequestOptions): Promise<Request> {
        const url = new URL(endpoint, this.baseURL); // Resolve endpoint relative to baseURL

        const requestHeaders = new Headers(this.defaultHeaders);

        // Merge custom headers from options using Headers constructor for robustness
        if (options.headers) {
            // Create a temporary Headers object from options.headers to iterate consistently
            const incomingHeaders = new Headers(options.headers);
            for (const [key, value] of incomingHeaders.entries()) {
                requestHeaders.set(key, value);
            }
        }

        // Add auth token unless skipped
        if (!options.skipAuth) {
            // Priority: Explicit clientAuthToken > getAccessTokenFromStore
            const token = this.clientAuthToken || (this.getAccessTokenFromStore ? this.getAccessTokenFromStore() : undefined);
            if (token) {
                requestHeaders.set('Authorization', `Bearer ${token}`);
            }
        }

        let processedBody: BodyInit | null | undefined = undefined;

        if (body instanceof FormData) {
            requestHeaders.delete('Content-Type'); // Important: Let browser set Content-Type for FormData
            processedBody = body;
        } else if (body !== undefined && body !== null) {
            const contentType = requestHeaders.get('Content-Type');
            // If Content-Type is JSON or it's a plain object (and not a Blob/File/Stream type of BodyInit), stringify it.
            if (contentType?.includes('application/json') ||
                (typeof body === 'object' &&
                 !(body instanceof Blob) &&
                 !(body instanceof ArrayBuffer) &&
                 !(body instanceof ReadableStream) && // Covers streams like Node.js Buffer
                 !(body instanceof URLSearchParams)
                )) {
                processedBody = JSON.stringify(body);
            } else {
                // Otherwise, assume `body` is already a valid BodyInit (string, Blob, ArrayBuffer, etc.)
                // A direct cast is used here as the prior checks narrow the type.
                processedBody = body as BodyInit;
            }
        }


        let request = new Request(url.toString(), {
            method: method,
            headers: requestHeaders,
            body: processedBody,
            ...options // Spread other fetch options like cache, credentials etc.
        });

        // Apply request interceptors sequentially
        for (const interceptor of this.requestInterceptors) {
            request = await Promise.resolve(interceptor(request));
        }

        return request;
    }

    /**
     * Processes the response, applying response interceptors and parsing the body.
     * @param response - The raw `Response` object from `fetch`.
     * @param options - The request options, used for `responseType`.
     * @returns The parsed response data or the raw `Response` object.
     * @throws `ApiError` if the response status is not OK (2xx).
     */
    private async processResponse<T>(response: Response, options: RequestOptions): Promise<T> {
        // Apply response interceptors sequentially
        for (const interceptor of this.responseInterceptors) {
            response = await Promise.resolve(interceptor(response));
        }

        if (!response.ok) {
            let errorMessage = response.statusText;
            let errorJson: object | undefined;
            // Clone the response before reading body for error parsing,
            // so original response body is still available if responseType is 'raw'.
            const errorResponseClone = response.clone();
            try {
                // Attempt to parse a more descriptive error message from JSON response
                errorJson = await errorResponseClone.json();
                errorMessage = (errorJson as { message?: string }).message || (errorJson as { error?: string }).error || JSON.stringify(errorJson);
            } catch (e) {
                // If response is not JSON, use default status text or log parsing error
                console.warn('API Client: Failed to parse error response as JSON.', e);
            }
            throw new ApiError(errorMessage, response.status);
        }

        switch (options.responseType) {
            case 'text':
                return (await response.text()) as T;
            case 'blob':
                return (await response.blob()) as T;
            case 'arrayBuffer':
                return (await response.arrayBuffer()) as T;
            case 'raw': return response as unknown as T;
            case 'json':
            default:
                // Handle 204 No Content (or other non-body responses)
                if (response.status === 204 || response.headers.get('Content-Length') === '0') {
                    return {} as T; // Return an empty object for no content
                }
                try {
                    return (await response.json()) as T;
                } catch {
                    throw new Error('Failed to parse response as JSON. Response was OK, but not valid JSON.');
                }
        }
    }

    /**
     * Handles errors by invoking registered error handlers.
     * @param error - The error that occurred during the request (type unknown to handle all potential errors).
     * @throws The original error if no handler fully resolves it.
     */
    private async handleError(error: unknown): Promise<void> {
        // Log the error by default
        console.error("API Client encountered an error:", error);

        // Cast to Error for common properties, or handle specifically
        const err = error instanceof Error ? error : new Error(String(error));

        // Apply registered error handlers
        for (const handler of this.errorHandlers) {
            await Promise.resolve(handler(err)); // Pass the Error object
        }
        // Re-throw the error if it hasn't been "handled" by a handler (e.g., by redirecting)
        // This ensures the calling context can still catch and react to the error.
        //throw err; //Not rethrowing the error here, as we want to return ApiResponse with error details.
    }

    /**
     * Generic request method. All other HTTP methods call this.
     * @param endpoint - The API endpoint.
     * @param method - The HTTP method.
     * @param body - The request body (optional). Can be BodyInit (string, Blob, FormData etc.) or a plain object (which will be JSON.stringified).
     * @param options - Request options.
     * @returns A Promise resolving to the parsed response data or raw Response/Blob.
     * @template T - Expected type of the response data.
     */
    async request<T>(endpoint: string, method: string, body: BodyInit | object | null | undefined, options: RequestOptions = {}): Promise<ApiResponse<T>> {
        const currentFetch = options.fetchInstance || fetch;

        try {
            const request = await this.processRequest(endpoint, method, body, options);
            const response = await currentFetch(request);
            const parsed = await this.processResponse<T>(response, options);

            return {
                ok: true,
                status: response.status,
                data: parsed as T
            };
        } catch (error: unknown) {            
            await this.handleError(error);
            
            const isApiError = error instanceof ApiError;
            const status = isApiError ? error.status : 503; // // Service Unavailable fallback
            const message = error instanceof Error ? error.message : 'Unexpected error occurred';
            const errorObj = getProblemDetail({status, title: "Server fetch error", type: "/exceptions/fetch-error/", detail: "Error fetching data from API", error: { server: [message] }});
            
            return {
                ok: false,
                status,
                error: errorObj
            };
        }
    }


    // --- HTTP Method Shorthands ---

    /**
     * Sends a GET request to the specified API endpoint.
     *
     * @param endpoint - The relative path (e.g., `/users` or `/orders/123`).
     * @param options - Optional request configuration.
     * @returns A Promise resolving to the parsed response or raw Response object.
     * @template T - Expected shape of the JSON response.
     */
    get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, 'GET', undefined, options);
    }

    /**
     * Sends a POST request to the specified API endpoint.
     *
     * @param endpoint - The relative path (e.g., `/products`).
     * @param data - The request body (object, JSON, or FormData).
     * @param options - Optional request configuration.
     * @returns A Promise resolving to the parsed response or raw Response object.
     * @template T - Expected shape of the JSON response.
     */
    post<T>(endpoint: string, data?: BodyInit | object | null, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, 'POST', data, options);
    }

    /**
     * Sends a PUT request to the specified API endpoint.
     * Typically used for full resource replacement.
     *
     * @param endpoint - The relative path (e.g., `/products/123`).
     * @param data - The request body (object, JSON, or FormData).
     * @param options - Optional request configuration.
     * @returns A Promise resolving to the parsed response or raw Response object.
     * @template T - Expected shape of the JSON response.
     */
    put<T>(endpoint: string, data?: BodyInit | object | null, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, 'PUT', data, options);
    }

    /**
     * Sends a PATCH request to the specified API endpoint.
     * Typically used for partial updates.
     *
     * @param endpoint - The relative path (e.g., `/users/123`).
     * @param data - The partial resource update (object or FormData).
     * @param options - Optional request configuration.
     * @returns A Promise resolving to the parsed response or raw Response object.
     * @template T - Expected shape of the JSON response.
     */
    patch<T>(endpoint: string, data?: BodyInit | object | null, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, 'PATCH', data, options);
    }

    /**
     * Sends a DELETE request to the specified API endpoint.
     *
     * @param endpoint - The relative path (e.g., `/orders/456`).
     * @param options - Optional request configuration.
     * @returns A Promise resolving to the parsed response or raw Response object.
     * @template T - Expected shape of the JSON response (if any).
     */
    delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        // 'delete' is a reserved keyword, but acceptable as a method name in classes.
        // If you encounter issues with specific environments, you could rename to 'del' or 'remove'.
        return this.request<T>(endpoint, 'DELETE', undefined, options);
    }

    // --- File Operations ---

    /**
     * Handles file uploads.
     * @param endpoint - The API endpoint for file upload.
     * @param file - The file to upload (File, Blob, or FormData). If Blob/File, it's wrapped in FormData.
     * @param fieldName - The name of the form field for the file (default: 'file').
     * @param options - Additional request options.
     * @returns A Promise resolving to the parsed response data.
     * @template T - Expected type of the response data after upload.
     */
    uploadFile<T>(endpoint: string, file: File | Blob | FormData, fieldName: string = 'file', options?: RequestOptions): Promise<ApiResponse<T>> {
        let uploadBody: FormData;
        if (file instanceof File || file instanceof Blob) {
            uploadBody = new FormData();
            uploadBody.append(fieldName, file);
        } else if (file instanceof FormData) {
            uploadBody = file;
        } else {
            throw new Error('uploadFile expects a File, Blob, or FormData object.');
        }

        // Create new Headers based on provided options, and then delete 'Content-Type'.
        // This ensures the browser sets the correct 'multipart/form-data' boundary.
        const headers = new Headers(options?.headers);
        headers.delete('Content-Type');

        return this.request<T>(endpoint, 'POST', uploadBody, { ...options, headers: headers });
    }

    /**
     * Handles file downloads.
     * @param endpoint - The API endpoint for file download.
     * @param options - Additional request options.
     * @returns A Promise resolving to a `Blob` containing the file data.
     */
    async downloadFile(endpoint: string, options?: RequestOptions): Promise<Blob> {
        const response = await this.request<Blob>(endpoint, 'GET', undefined, { ...options, responseType: 'blob' });
        // Ensure the returned type is indeed a Blob before casting, for stricter type safety.
        if (!(response instanceof Blob)) {
             throw new Error('Expected Blob response for downloadFile, but got a different type or raw Response. Ensure responseType is explicitly set to "blob".');
        }
        return response;
    }

    /**
     * Uploads a file to the specified API endpoint using XMLHttpRequest to track upload progress.
     *
     * This method supports file uploads via `multipart/form-data`, reports progress using a callback,
     * and handles authentication headers and additional request headers.
     *
     * @param endpoint - The API endpoint to upload the file to (relative to baseURL).
     * @param file - The file or blob to upload.
     * @param onProgress - A callback that receives percentage progress updates (0–100).
     * @param fieldName - The name of the form field used for the file (default is 'file').
     * @param options - Optional request settings (headers, skipAuth, etc.).
     * @returns A Promise resolving to the typed response from the server.
     * @template T - Expected shape of the server's JSON response.
     */
    async uploadFileWithProgress<T>(endpoint: string, file: File | Blob, onProgress: (percent: number) => void, fieldName = 'file', options: RequestOptions = {}): Promise<T> {
        const url = new URL(endpoint, this.baseURL).toString();
        const formData = new FormData();
        formData.append(fieldName, file);

        const token = this.clientAuthToken || this.getAccessTokenFromStore?.();
        const headers = new Headers(this.defaultHeaders);

        // Merge user-supplied headers
        if (options.headers) {
            const userHeaders = new Headers(options.headers);
            userHeaders.forEach((value, key) => headers.set(key, value));
        }

        return new Promise<T>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open('POST', url, true);

            // Add Authorization if not skipped
            if (!options.skipAuth && token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            // Add any remaining headers
            headers.forEach((value, key) => {
                // Let the browser set Content-Type for FormData
                if (key.toLowerCase() !== 'content-type') {
                    xhr.setRequestHeader(key, value);
                }
            });

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    onProgress(Math.round((event.loaded / event.total) * 100));
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const contentType = xhr.getResponseHeader('Content-Type') || '';
                    if (contentType.includes('application/json')) {
                        try {
                            const json: T = JSON.parse(xhr.responseText);
                            resolve(json);
                        } catch {
                            reject(new Error('Failed to parse JSON response'));
                        }
                    } else {
                        // If not JSON, cast explicitly to unknown first, then to T
                        resolve(xhr.responseText as unknown as T);
                    }
                } else {
                    reject(new ApiError(xhr.statusText, xhr.status));
                }
            };


            xhr.onerror = () => reject(new Error('Upload failed'));
            xhr.send(formData);
        });
    }


    /**
     * Downloads a file from the specified endpoint while reporting progress.
     *
     * This method streams the response using a readable stream, reads it chunk by chunk,
     * and accumulates the data into a Blob. During the download, it calculates and emits
     * percentage progress updates if the `Content-Length` header is provided.
     *
     * @param endpoint - The API endpoint to download the file from.
     * @param onProgress - Callback that receives progress updates (as a percent from 0 to 100).
     * @param options - Optional request options including headers, credentials, etc.
     * @returns A Promise that resolves to a Blob containing the downloaded file.
     */
	async downloadWithProgress(endpoint: string, onProgress: (percent: number) => void, options?: RequestOptions): Promise<Blob> {
        const res = await this.request<Response>(endpoint, 'GET', undefined, {...options, responseType: 'raw' });

        if (!res.ok || !res.data) {
            throw new Error(`Download failed: ${res.error ?? 'Unknown error'}`);
        }

        const response = res.data; // This is the raw Response object

        const contentLengthHeader = response.headers.get('Content-Length');
        const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

        const reader = response.body?.getReader();
        if (!reader) throw new Error('Failed to get reader from response body.');

        const chunks: Uint8Array[] = [];
        let loaded = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
            chunks.push(value);
            loaded += value.length;
            if (contentLength) {
                onProgress(Math.round((loaded / contentLength) * 100));
            }
            }
        }

        return new Blob(chunks);
    }


	/**
     * Executes multiple request functions concurrently and infers their return types.
     * 
     * @param requests - An array of functions that each return a typed Promise.
     * @returns A Promise resolving to an array of results, with types preserved.
     */
    batch<T extends ReadonlyArray<() => Promise<unknown>>>(requests: T): Promise<{[K in keyof T]: T[K] extends () => Promise<infer R> ? R : never;}> {
        return Promise.all(requests.map((req) => req())) as Promise<{[K in keyof T]: T[K] extends () => Promise<infer R> ? R : never;}>;
    }


}
