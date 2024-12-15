import mongoose from "mongoose";

const userAnalytics = new mongoose.Schema({
    userSub: { type: String, required: true},
    timestamp: { type: Date, default: Date.now},
    ipAddress: { type: String, required: true },
    distance: { type: Number, default: null },
    deviceType: { type: String, required: true},
    trustIndex: { type: Number, default: 0 }
});

export default mongoose.model('Analytics', userAnalytics);
