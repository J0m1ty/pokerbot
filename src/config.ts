import 'dotenv/config';

// Constants
export const PORT = 4040;
export const EMBED_COLOR = 0x0099FF;
export const ACK_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Secret keys
export const TOKEN = process.env.TOKEN ?? '';
export const GUILD_ID = process.env.GUILD_ID ?? '';
export const CLIENT_ID = process.env.CLIENT_ID ?? '';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
export const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN ?? '';
export const DISCORD_VERIFIED_ROLE_ID = process.env.DISCORD_VERIFIED_ROLE_ID ?? '';
export const DISCORD_MEMBERSHIP_ROLE_ID = process.env.DISCORD_MEMBERSHIP_ROLE_ID ?? '';
export const THUMBNAIL_URL = process.env.THUMBNAIL_URL ?? '';
export const GUILD_ICON_URL = process.env.GUILD_ICON_URL ?? '';
export const CLIENT_AVATAR_URL = process.env.CLIENT_AVATAR_URL ?? '';