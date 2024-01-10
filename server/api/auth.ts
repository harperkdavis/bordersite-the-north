import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { generateUsername } from 'unique-username-generator';

import User from '../data/models/user.js';
import { createSession, destroySession, requireSession } from '../session.js';

const router = express.Router();

router.post('/register', 
    body('name').notEmpty().isString().matches(/^[a-zA-Z0-9_.-]+$/).isLength({ min: 3, max: 20 }).trim().escape(),
    body('password').notEmpty().isString().isLength({ min: 1, max: 256 }),
async (req: Request, res: Response) => {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ 
            error: { 
                message: 'Invalid username or password', 
                errors: result.array() 
            } 
        });
    }

    const { name, password } = req.body;

    if (await User.exists({ name })) {
        return res.status(400).json({ error: { message: 'Username is taken' } });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    const user = new User({ name, hash, salt, guest: false });
    try {
        await user.save();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: { message: 'Internal server error' } });
    }

    createSession(req, user._id.toString());

    console.log(`User ${user._id} (${name}) registered`);

    return res.status(200).json({ message: 'success' });
});

router.post('/guest', async (req: Request, res: Response) => {
    
    const name = generateUsername();

    const salt = crypto.randomBytes(16).toString('hex');
    const password = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    const user = new User({ name, hash, salt, guest: true });

    try {
        await user.save();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: { message: 'Internal server error' } });
    }

    createSession(req, user._id.toString());

    console.log(`Guest ${user._id} (${name}) registered`);

    return res.status(200).json({ message: 'success' });

});

router.post('/login', 
    body('name').notEmpty().isString().matches(/^[a-zA-Z0-9_.-]+$/).isLength({ min: 1, max: 20 }).trim().escape(),
    body('password').notEmpty().isString().isLength({ min: 1, max: 256 }),
async (req: Request, res: Response) => {
    
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ 
            error: { 
                message: 'Invalid username or password', 
                errors: result.array() 
            } 
        });
    }

    const { name, password } = req.body;

    const user = await User.findOne({ name });
    if (!user) {
        return res.status(400).json({ error: { message: 'Invalid username or password' } });
    }

    const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
    if (hash !== user.hash) {
        return res.status(400).json({ error: { message: 'Invalid username or password' } });
    }

    console.log(`User ${user._id} (${user.name}) login`);

    createSession(req, user._id.toString());

    return res.status(200).json({ message: 'success' });
});

router.post('/logout', requireSession, (req, res) => {
    destroySession(req);
    return res.status(200).json({ message: 'success' });
});

router.get('/session', requireSession, (req, res) => {
    return res.status(200).json({ message: 'success', userId: req.session.userId });
});

export default router;