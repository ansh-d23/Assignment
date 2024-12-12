import mongoose from "mongoose";

const connectDB = async () => { 
    mongoose.connect('mongodb+srv://anshshrivastav032:l8P8CjZ52HpTpjMn@cluster0.tpy8oty.mongodb.net/uniq')
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((e) => {
            console.error('Error connecting to MongoDB:', e.message);
        });
};

export default connectDB;