"use strict";
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
const user_model_1 = __importDefault(require("../models/user.model"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
class UserRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password, } = data;
                if ([username, email, password].some((value) => (value === null || value === void 0 ? void 0 : value.trim()) === "")) {
                    return new ApiError_1.default(400, `Please fill all the fields`);
                }
                // check user is availble in db or not
                const user = yield user_model_1.default.findOne({
                    $or: [{ username }, { email }]
                });
                if (user) {
                    throw new ApiError_1.default(409, `Username and email belongs to an account. Please login.`);
                }
                const newUser = yield user_model_1.default.create(data);
                //----Check newUser is creating in db or not
                const createdUser = yield user_model_1.default.findById(newUser._id).select("-password -refreshToken");
                if (!createdUser) {
                    throw new ApiError_1.default(500, "Something went wrong during regiter user. Please try again letter.");
                }
                return createdUser;
            }
            catch (error) {
                console.error('Error at user repo create level:', error);
                throw new Error('Error while creating user');
            }
        });
    }
    destroy(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield user_model_1.default.deleteOne({
                    _id: userId
                });
                return result.deletedCount === 1;
            }
            catch (error) {
                console.error('Error at user repo destroy level:', error);
                throw new Error('Error while deleting user');
            }
        });
    }
}
exports.default = UserRepository;
