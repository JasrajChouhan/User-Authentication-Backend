"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const rateLimitterMiddleware_1 = __importDefault(require("./rateLimitterMiddleware"));
function applyMiddlewares(app) {
    // ------Body parsers
    app.use(express_1.default.urlencoded({
        extended: true,
        limit: "5mb"
    }));
    app.use(express_1.default.json({
        limit: `16mb`
    }));
    // -------Security and performance middlewares
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    // -------Logging
    app.use((0, morgan_1.default)('dev'));
    // -------Cookies management
    app.use((0, cookie_parser_1.default)());
    app.use(rateLimitterMiddleware_1.default);
}
exports.default = applyMiddlewares;
