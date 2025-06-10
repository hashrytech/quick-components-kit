import crypto from 'node:crypto';

// Command to generate a random 32-byte base64 key for AES-256 encryption
// node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

/**
 * Encrypts plaintext using AES-256-GCM.
 * Provides confidentiality, integrity, and authenticity.
 *
 * @param plaintext The string to encrypt.
 * @param secretKey The 256-bit (32-byte) secret key, base64url encoded.
 * @returns The encrypted data (IV + Tag + Ciphertext), base64url encoded.
 */
export function encrypt(plaintext: string, secretKey: string): string {
    const key: Buffer = Buffer.from(secretKey, 'base64url'); // Ensure key is 32 bytes after decoding

    if (key.length !== 32) {
        throw new Error('Secret key must be 32 bytes (256 bits) for AES-256-GCM.');
    }

    const iv = crypto.randomBytes(16); // Initialization Vector (IV) for GCM is 16 bytes (128 bits)
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag(); // Authentication Tag

    // Concatenate IV, Tag, and Ciphertext for storage/transmission
    const combined = Buffer.concat([iv, tag, encrypted]);

    return combined.toString('base64url');
}

/**
 * Decrypts data encrypted with AES-256-GCM.
 * Verifies authenticity before decrypting.
 *
 * @param ivTagCiphertextB64 The encrypted data (IV + Tag + Ciphertext), base64url encoded.
 * @param secretKey The 256-bit (32-byte) secret key, base64url encoded.
 * @returns The decrypted plaintext string.
 * @throws Error if authentication tag is invalid (data tampering) or decryption fails.
 */
export function decrypt(ivTagCiphertextB64: string, secretKey: string): string {
    const key: Buffer = Buffer.from(secretKey, 'base64url'); // Ensure key is 32 bytes after decoding

    if (key.length !== 32) {
        throw new Error('Secret key must be 32 bytes (256 bits) for AES-256-GCM.');
    }

    const combined = Buffer.from(ivTagCiphertextB64, 'base64url');

    // Extract IV (16 bytes), Tag (16 bytes), and Ciphertext
    const iv = combined.subarray(0, 16);
    const tag = combined.subarray(16, 32);
    const ciphertext = combined.subarray(32);

    if (iv.length !== 16) {
		throw new Error('Invalid IV length: Expected 16 bytes.');
	}
    
	if (tag.length !== 16) {
		throw new Error('Invalid Auth Tag length: Expected 16 bytes.');
	}

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag); // Set the authentication tag for verification

    try {
        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return decrypted.toString('utf-8');
    } catch (e: unknown) {
        // 'Bad decrypt' or 'Unsupported state or unable to authenticate data' indicates tampering or wrong key/IV/tag
        if (e instanceof Error && (e.message.includes('Unsupported state') || e.message.includes('unable to authenticate data'))) {
            throw new Error('Decryption failed: Data may have been tampered with or key is incorrect.');
        }
        throw e; // Re-throw other unexpected errors
    }
}

/**
 * Generates random bytes and returns them as a base64url encoded string.
 * Useful for generating cryptographic keys or nonces.
 *
 * @param length The number of random bytes to generate.
 * @returns A base64url encoded string of random bytes.
 */
export function generateRandomBytes(length: number): string {
    if (length <= 0) {
        throw new Error('Length must be a positive number.');
    }
    return crypto.randomBytes(length).toString('base64url');
}

