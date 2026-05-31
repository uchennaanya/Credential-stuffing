import mongoose from 'mongoose';

const LoginAttemptSchema = new mongoose.Schema({
    username: { type: String, required: true },
    ip: { type: String, required: true },
    country: { type: String, required: true },
    userAgent: { type: String },
    riskScore: { type: Number, required: true },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    reasons: [{ type: String }],
    status: { type: String, enum: ['success', 'flagged', 'blocked'] },
    timestamp: { type: Date, default: Date.now },
});

const LoginAttempt = mongoose.models.LoginAttempt || mongoose.model('LoginAttempt', LoginAttemptSchema);

export default LoginAttempt;