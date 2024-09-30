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
const mongoose_1 = __importDefault(require("mongoose"));
const serverConfig_1 = __importDefault(require("../config/serverConfig"));
function dbConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        const MONGO_DB_URI = serverConfig_1.default.MONGO_DB_URI;
        if (!MONGO_DB_URI) {
            console.log(`MongoDB URI is not provided in server configuration.gured`);
            process.exit(1);
        }
        try {
            yield mongoose_1.default.connect(MONGO_DB_URI);
            console.log(`Successfully connected mongodb uri ${MONGO_DB_URI}`);
            mongoose_1.default.connection.on('disconnected', () => {
                console.log(`MongoDB is disconnected!!`);
            });
            mongoose_1.default.connection.on('error', (error) => {
                console.log(`MongoDB connection error`, error);
            });
        }
        catch (error) {
            console.error('Error while connecting to MongoDB:', error);
            process.exit(1);
        }
    });
}
exports.default = dbConnection;
