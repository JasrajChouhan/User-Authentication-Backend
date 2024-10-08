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
const userService_1 = __importDefault(require("../services/userService"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const userService = new userService_1.default();
function create(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield userService.create(req.body);
            return res.status(201).json(new ApiResponse_1.default(201, user, "User register successfully."));
        }
        catch (error) {
            console.error('Error while creating user:', error.message || error);
            throw new ApiError_1.default(500, "Something went wrong during user creation. Please try agian lette.");
        }
    });
}
exports.default = create;
