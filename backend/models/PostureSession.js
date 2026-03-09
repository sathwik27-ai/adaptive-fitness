const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostureSessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    avgScore: { type: Number, required: true },       // 0-100
    duration: { type: Number, required: true },        // seconds
    correctionsTriggered: { type: Number, default: 0 },
    angles: {
        avgShoulderHip: { type: Number },
        avgNeckTilt: { type: Number },
        avgBackStraightness: { type: Number },
    },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('PostureSession', PostureSessionSchema);
