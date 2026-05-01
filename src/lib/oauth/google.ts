export const GOOGLE_OAUTH_CONFIG = {
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
  scope: 'openid email profile',
};

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: GOOGLE_OAUTH_CONFIG.scope,
    state,
    access_type: 'online',           // we don't need refresh tokens from Google
    prompt: 'select_account',        // show account picker
  });
  return `${GOOGLE_OAUTH_CONFIG.authUrl}?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  id_token: string;
  expires_in: number;
}> {
  const response = await fetch(GOOGLE_OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  });
  if (!response.ok) throw new Error('GOOGLE_TOKEN_EXCHANGE_FAILED');
  return response.json();
}

export async function fetchGoogleProfile(accessToken: string): Promise<{
  id: string;              // Google's "sub" — stable, unique per user
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}> {
  const response = await fetch(GOOGLE_OAUTH_CONFIG.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('GOOGLE_PROFILE_FETCH_FAILED');
  return response.json();
}
