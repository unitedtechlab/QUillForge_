import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

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
            
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },

        role:{
            type: String,
            enum: ["user", "admin"],
            default: "user"
            
        }
    },{
        timestamps: true
    });
    
    userSchema.pre('save', async function (next) {
         if (!this.password) {
        return;
    }
        if (!this.isModified('password')) {
            return ;
        }
        this.password = await bcrypt.hash(this.password, 10);
  
    });

    userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(
        password,
        this.password
    );
};



// console.log("JWT_SECRET =", process.env.JWT_SECRET);
    userSchema.methods.generateAccessToken = function() {
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                username: this.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );
    };

    const User = mongoose.model('User', userSchema);
    
    export default User;
    // test