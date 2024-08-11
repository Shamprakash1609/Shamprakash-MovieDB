import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    username: String,
    password: String,
    age: Number,
    gender: String,
});

const User = mongoose.model('User', userSchema);

export default User;
