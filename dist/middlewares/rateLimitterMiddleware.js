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
Object.defineProperty(exports, "__esModule", { value: true });
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
// User can send 5 request in 2 mintues
const rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    points: 5, // 5 request
    duration: 120 // 2 mintues
});
function rateLimiterMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let ipAddress = req.ip;
        if (!ipAddress) {
            res.status(400).json({
                success: false,
                message: `Client is dissconnect or ip address not found.`
            });
        }
        try {
            yield rateLimiter.consume(ipAddress);
            next();
        }
        catch (error) {
            res.status(429).json({
                success: false,
                message: "Too Many Requests"
            });
        }
    });
}
;
exports.default = rateLimiterMiddleware;
