import { strict as assert } from 'node:assert';
import { describe, it, beforeEach, after } from 'node:test';
import { buildAuthUrl, GOOGLE_OAUTH_CONFIG } from '../google';

describe('Google OAuth helpers', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback';
  });

  after(() => {
    process.env = ORIGINAL_ENV;
  });

  it('buildAuthUrl includes all required params', () => {
    const url = buildAuthUrl('test-state-123');
    const parsed = new URL(url);
    
    assert.strictEqual(parsed.origin + parsed.pathname, GOOGLE_OAUTH_CONFIG.authUrl);
    assert.strictEqual(parsed.searchParams.get('client_id'), 'test-client-id');
    assert.strictEqual(parsed.searchParams.get('redirect_uri'), 'http://localhost:3000/api/auth/google/callback');
    assert.strictEqual(parsed.searchParams.get('response_type'), 'code');
    assert.strictEqual(parsed.searchParams.get('state'), 'test-state-123');
    assert.strictEqual(parsed.searchParams.get('access_type'), 'online');
    assert.strictEqual(parsed.searchParams.get('prompt'), 'select_account');
  });

  it('buildAuthUrl URL-encodes scope correctly', () => {
    const url = buildAuthUrl('test-state');
    const parsed = new URL(url);
    assert.strictEqual(parsed.searchParams.get('scope'), GOOGLE_OAUTH_CONFIG.scope);
  });
});
