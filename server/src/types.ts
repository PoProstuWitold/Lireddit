import { Connection, EntityManager, IDatabaseDriver } from '@mikro-orm/core'
import { Request, Response } from 'express'
//import { Session, SessionData } from 'express-session' //either import this and uncomment second part of req type or uncomment declare module

declare module 'express-session' {
    export interface SessionData {
        userId?: number;
    }
}

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
    req: Request; //& { session: Session & Partial<SessionData> & { userId?: number } };
    res: Response;
}