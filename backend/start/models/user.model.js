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
            enum: ["user", "admin", "pro"],
            default: "user"
        },
        aiQuota: {
            generationsCount: {
                type: Number,
                default: 0
            },
            resetDate: {
                type: Date,
                default: () => {
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    return nextMonth;
                }
            }
        }
    },{
        timestamps: true
    });
    
    userSchema.pre('save', async function () {
        if (!this.password || !this.isModified('password')) {
            return;
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
                username: this.username,
                role: this.role
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