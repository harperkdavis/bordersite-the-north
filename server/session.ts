import { Response } from 'express';
import session from 'express-session';

import MongoStore from 'connect-mongo';
import { MongoClient } from 'mongodb';

declare module 'express-session' {
    interface SessionData {
        userId: string;
    }
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';

export function sessionConfig(promise: Promise<typeof import('mongoose')>) {
    return session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        store: MongoStore.create({
            clientPromise: promise.then(client => client.connection.getClient()) as Promise<MongoClient>,
            ttl: 60 * 60 * 24 * 7, // 1 week
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
            sameSite: true,
            secure: process.env.NODE_ENV === 'production',
        },
    });
}

export interface Request extends Express.Request {
    session: session.Session & Partial<session.SessionData>;
}

export function createSession(req: Request, userId: string) {
    req.session.userId = userId;
}

export function destroySession(req: Request) {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
        }
    });
}

export function requireSession(req: Request, res: Response, next: Function) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

