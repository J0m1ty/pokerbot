import { createTransport } from 'nodemailer';
import { google } from 'googleapis';

// Load environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN ?? '';

// Create an OAuth2 client; we need this because emails programmatically sent from .rit.edu need special authentication
export const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

// Set the OAuth2 client's credentials
oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
    scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify'
});

// Create a transporter; a transport is an object that sends emails
const create = async () => {
    const { token } = await oauth2Client.getAccessToken(); // rotating access token (stupid)

    if (!token) return null;

    return createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            user: 'jss5874@g.rit.edu',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: token,
        }
    });
}

/**
 * Sends an email to the specified address
 */
export async function sendEmail(to: string, subject: string, text: string) {
    const transporter = await create();

    if (!transporter) return false;

    return new Promise<boolean>((resolve, reject) => {
        transporter.sendMail({
            from: 'RIT Poker Club',
            replyTo: 'jss5874@g.rit.edu',
            to,
            subject,
            text,
        }, (err) => {
            if (err) {
                console.error(err);
            }

            resolve(!err);
        });
    });
}