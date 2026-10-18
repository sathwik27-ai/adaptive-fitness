const validateEnv = (env = process.env) => {
    const missing = ['JWT_SECRET'].filter((name) => !env[name]?.trim());
    const mongoURI = env.MONGO_URI?.trim() || env.MONGODB_URI?.trim();
    if (!mongoURI) {
        missing.push('MONGO_URI (or MONGODB_URI)');
    }
    if (missing.length) {
        throw new Error(`Missing required environment variable(s): ${missing.join(', ')}. Configure backend/.env using backend/.env.example.`);
    }

    if (env.JWT_SECRET.length < 32 || /^(replace|your|change|example)[-_]/i.test(env.JWT_SECRET)) {
        throw new Error('JWT_SECRET must be a unique, randomly generated secret of at least 32 characters. Do not use the .env.example placeholder.');
    }

    const credentialPairs = [
        ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
        ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
        ['GMAIL_USER', 'GMAIL_APP_PASSWORD'],
    ];
    for (const [first, second] of credentialPairs) {
        if (Boolean(env[first]) !== Boolean(env[second])) {
            throw new Error(`${first} and ${second} must either both be configured or both be left empty.`);
        }
    }

    const cloudinaryVariables = [
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
    ];
    const cloudinaryConfigured = cloudinaryVariables.filter((name) => env[name]);
    if (cloudinaryConfigured.length > 0 && cloudinaryConfigured.length < cloudinaryVariables.length) {
        throw new Error(`Cloudinary configuration is incomplete. Set all of: ${cloudinaryVariables.join(', ')}.`);
    }
};

module.exports = { validateEnv };
