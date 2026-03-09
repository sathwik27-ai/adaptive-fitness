const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },                        // null for OAuth users
    oauthProvider: { type: String, enum: ['google', 'facebook', null], default: null },
    oauthId: { type: String },
    avatar: { type: String },                        // Cloudinary URL
    profile: {
        age: { type: Number },
        gender: { type: String, enum: ['male', 'female', 'non-binary', 'prefer-not'] },
        height: { type: Number },                      // cm
        weight: { type: Number },                      // kg
        goal: { type: String, enum: ['weight-loss', 'muscle-gain', 'endurance', 'maintenance'] },
        fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
        location: { type: String, enum: ['home', 'gym'] },
        equipment: [{ type: String }],                    // ['dumbbells', 'resistance-bands', ...]
        timePerWorkout: { type: Number },                      // minutes
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    onboardingComplete: { type: Boolean, default: false },
    workoutPlan: { type: Object },
    savedWorkouts: [{ type: Schema.Types.ObjectId, ref: 'Workout' }],
    savedMeals: [{ type: Schema.Types.ObjectId, ref: 'Meal' }],
    badges: [{
        badgeId: { type: String },
        unlockedAt: { type: Date, default: Date.now }
    }],
    googleFitTokens: {
        accessToken: { type: String },
        refreshToken: { type: String },
        expiryDate: { type: Date },
        isPaused: { type: Boolean, default: false }
    },
    lastHealthSync: { type: Date },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare passwords
UserSchema.methods.matchPassword = async function (entered) {
    return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
