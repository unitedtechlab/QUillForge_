import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
            
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },  
        password: {
            type: String,
            required: true
        }
    },{
        timestamps: true
    });
    
    userSchema.pre('save', async function (next) {
        if (!this.isModified('password')) {
            return next();
        }
        this.password = await bcrypt.hash(this.password, 10);
        next();
    });

    userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(
        password,
        this.password
    );
};

    const User = mongoose.model('User', userSchema);
    
    export default User;
    // test