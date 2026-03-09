const { google } = require('googleapis');
const User = require('../models/User');

class GoogleFitService {
    static getClient() {
        const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/health/google-fit/callback`;
        console.log('Google Fit Redirect URI:', redirectUri);
        return new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUri
        );
    }

    static getAuthUrl(state) {
        const oauth2Client = this.getClient();
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            state,
            scope: [
                'https://www.googleapis.com/auth/fitness.activity.read',
                'https://www.googleapis.com/auth/fitness.heart_rate.read',
                'https://www.googleapis.com/auth/fitness.body.read',
            ],
        });
    }

    static async getTokens(code) {
        try {
            const oauth2Client = this.getClient();
            const { tokens } = await oauth2Client.getToken(code);
            return tokens;
        } catch (err) {
            console.error('getTokens Error Details:', err.response?.data || err.message);
            throw err;
        }
    }

    static async getAuthorizedClient(user) {
        const oauth2Client = this.getClient();
        oauth2Client.setCredentials({
            access_token: user.googleFitTokens.accessToken,
            refresh_token: user.googleFitTokens.refreshToken,
            expiry_date: user.googleFitTokens.expiryDate?.getTime(),
        });

        // Handle auto refresh
        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.refresh_token) {
                user.googleFitTokens.refreshToken = tokens.refresh_token;
            }
            user.googleFitTokens.accessToken = tokens.access_token;
            user.googleFitTokens.expiryDate = new Date(tokens.expiry_date);
            await user.save();
        });

        return oauth2Client;
    }

    static async fetchMetric(user, type, startTime, endTime) {
        const client = await this.getAuthorizedClient(user);
        const fitness = google.fitness({ version: 'v1', auth: client });

        const dataTypeMap = {
            steps: 'com.google.step_count.delta',
            heart_rate: 'com.google.heart_rate.bpm',
            calories: 'com.google.calories.expended'
        };

        const response = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [{ dataTypeName: dataTypeMap[type] }],
                bucketByTime: { durationMillis: (endTime - startTime).toString() },
                startTimeMillis: startTime.toString(),
                endTimeMillis: endTime.toString(),
            },
        });

        const buckets = response.data.bucket;
        if (!buckets || buckets.length === 0) return 0;

        const points = buckets[0].dataset[0].point;
        if (!points || points.length === 0) return 0;

        const value = points[0].value[0];
        return value.intVal || value.fpVal || 0;
    }

    static async syncDailyData(user, date = new Date()) {
        const startTime = new Date(date.setHours(0, 0, 0, 0)).getTime();
        const endTime = new Date(date.setHours(23, 59, 59, 999)).getTime();

        const [steps, heartRate, calories] = await Promise.all([
            this.fetchMetric(user, 'steps', startTime, endTime),
            this.fetchMetric(user, 'heart_rate', startTime, endTime),
            this.fetchMetric(user, 'calories', startTime, endTime),
        ]);

        return { steps, heartRate, calories };
    }
}

module.exports = GoogleFitService;
