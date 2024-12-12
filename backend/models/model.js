import mongoose from "mongoose";

const UserPreferenceSchema = new mongoose.Schema({
    role: { type: String, default: 'user' },
    userSub: { type: String, unique: true, required: true },
    name: { type: String, default: null, index: false },
    e_Permission: { type: Boolean, required: true },
    p_Permission: { type: Boolean, required: true },
    a_Permission: { type: Boolean, required: true },
    email: { type: String, default: null }, 
    phone: { type: String, default: null }, 
    address: { type: String, default: null }, 
    firstTimeLogin: { type: Boolean, default: true }
});

export default mongoose.model('UserPreference', UserPreferenceSchema);
