import bcrypt, { genSalt } from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

import serverConfigVariable from "../config/serverConfig";

const SALT_WORK_FECTOR = Number(serverConfigVariable.SALT_WORK_FECTOR || 10);

export interface IUser extends mongoose.Document {
    email: string;
    password: string;
    userRole: "guest" | "user";
    username: string;
    refreshToken: string | undefined;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateAccessToken: () => Promise<string>;
    generateRefreshToken: () => Promise<string>;
}



const UserSchema = new mongoose.Schema<IUser>({

    username: {
        type: String,
        required: true,
        match: [/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/, 'Username must be valid'],
        unique: true,
        index: true,
        trim: true,
        lowercase: true
    },

    email: {
        type: String,
        required: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Email must be valid'],
        unique: true,
        index: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "Password must be at least 8 characters"],
        maxlength: [20, "Password must have at most 20 characters"],
        match: [/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}/, "Password must contain small and capital letters, and include special characters"],
        trim: true
    },
    userRole: {
        type: String,
        enum: ["guest", "user"],
        default: "user",
        trim: true,
        required: true
    },
    refreshToken: {
        type: String,
    }

}, { timestamps: true });

// -----Pre-save hook for user model
UserSchema.pre('save', async function (next) {
    const user = this as IUser;

    // ----Only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    try {
        const salt = await genSalt(SALT_WORK_FECTOR);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        next();
    } catch (err: any) {
        next(err);
    }
});

//------whole user-schema methods

UserSchema.methods = {

    // ---Method to compare passwords

    comparePassword: async function (candidatePassword: string) {
        return await bcrypt.compare(candidatePassword, this.password);
    },

    // ---- Generate access and refresh token

    generateAccessToken: async function () {
        return jwt.sign({
            _id: this._id,
            username: this.username,
            email: this.email,
            password: this.password


        }, serverConfigVariable.ACCESS_TOKEN_SECRET
            , {
                expiresIn: serverConfigVariable.ACCESS_TOKEN_EXPIREY
            })
    },


    generateRefreshToken: async function () {
        return jwt.sign({
            _id: this._id,
            username: this.id,
            email: this.email,
            password: this.password

        }, serverConfigVariable.REFRESH_TOKEN_SECRET
            , {
                expiresIn: serverConfigVariable.REFRESH_TOKEN_EXPIREY
            })
    },

}





const User = mongoose.model<IUser>('User', UserSchema);
export default User;
