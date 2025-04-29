export const getAccessToken = async (): Promise<string> => {
  const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
  const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
  const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
    throw new Error(
      "Missing required environment variables for Strava authentication."
    );
  }

  const params = new URLSearchParams();
  params.append("client_id", STRAVA_CLIENT_ID);
  params.append("client_secret", STRAVA_CLIENT_SECRET);
  params.append("refresh_token", STRAVA_REFRESH_TOKEN);
  params.append("grant_type", "refresh_token");

  const res = await fetch("https://www.strava.com/api/v3/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Auth error: ${res.status} - ${text}`);
  }

  const json = await res.json();
  return json.access_token;
};
