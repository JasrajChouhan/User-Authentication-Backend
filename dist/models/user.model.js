"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importStar(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const serverConfig_1 = __importDefault(require("../config/serverConfig"));
const SALT_WORK_FECTOR = Number(serverConfig_1.default.SALT_WORK_FECTOR || 10);
const UserSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Email must be valid'], // todo :: correct the regex match type for username
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
UserSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        // ----Only hash the password if it has been modified (or is new)
        if (!user.isModified('password'))
            return next();
        try {
            const salt = yield (0, bcrypt_1.genSalt)(SALT_WORK_FECTOR);
            const hashedPassword = yield bcrypt_1.default.hash(user.password, salt);
            user.password = hashedPassword;
            next();
        }
        catch (err) {
            next(err);
        }
    });
});
//------whole user-schema methods
UserSchema.methods = {
    // ---Method to compare passwords
    comparePassword: function (candidatePassword, cb) {
        bcrypt_1.default.compare(candidatePassword, this.password, function (err, isMatch) {
            if (err)
                return cb(err);
            cb(null, isMatch);
        });
    },
    // ---- Generate access and refresh token
    generateAccessToken: function () {
        return __awaiter(this, void 0, void 0, function* () {
            jsonwebtoken_1.default.sign({
                id: this._id,
                username: this._id,
                email: this._email,
                password: this._password
            }, serverConfig_1.default.ACCESS_TOKEN_SECRET, {
                expiresIn: serverConfig_1.default.ACCESS_TOKEN_EXPIREY
            });
        });
    },
    generateRefreshToken: function () {
        return __awaiter(this, void 0, void 0, function* () {
            jsonwebtoken_1.default.sign({
                id: this._id,
                username: this._id,
                email: this._email,
                password: this._password
            }, serverConfig_1.default.REFRESH_TOKEN_SECRET, {
                expiresIn: serverConfig_1.default.REFRESH_TOKEN_EXPIREY
            });
        });
    },
};
const User = mongoose_1.default.model('User', UserSchema);
exports.default = User;
