import { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// User can send 5 request in 2 mintues

const rateLimiter = new RateLimiterMemory({
    points: 5,      // 5 request
    duration: 120  // 2 mintues
})

async function rateLimiterMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    let ipAddress = req.ip as string | number;

    if(!ipAddress) {
        res.status(400).json({
            success : false,
            message : `Client is dissconnect or ip address not found.`
        })
    }

    try {
        await rateLimiter.consume(ipAddress)
        next()
    } catch (error) {
        res.status(429).json({
            success: false,
            message: "Too Many Requests"
        });
    }
};

export default rateLimiterMiddleware;