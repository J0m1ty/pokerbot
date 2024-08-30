import { createTransport } from 'nodemailer';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } from './config.js';
import { google } from 'googleapis';

export const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN,
    scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify'
});

const createTransporter = async () => {
    const { token } = await oauth2Client.getAccessToken();

    if (!token) return null;

    return createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            user: 'jss5874@g.rit.edu',
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            refreshToken: GOOGLE_REFRESH_TOKEN,
            accessToken: token,
        }
    });
}

export async function sendEmail(to: string, subject: string, text: string) {
    const transporter = await createTransporter();

    if (!transporter) return false;

    return new Promise<boolean>((resolve, reject) => {
        transporter.sendMail({
            from: 'RIT Poker Club',
            replyTo: 'info@jomity.net',
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