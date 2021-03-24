import { Request, Response } from 'express'
import { Redis } from 'ioredis'
//import { Session, SessionData } from 'express-session' //either import this and uncomment second part of req type or uncomment declare module

declare module 'express-session' {
    export interface SessionData {
        userId?: number;
    }
}

export type MyContext = {
    req: Request; //& { session: Session & Partial<SessionData> & { userId?: number } };
    res: Response;
    redis: Redis
}