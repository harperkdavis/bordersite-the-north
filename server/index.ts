import dotenv from 'dotenv'; dotenv.config();
import express from 'express';
import http from 'http';

const app = express();

import databasePromise from './data.js';
const dbPromise = databasePromise();

import { sessionConfig } from './session.js';
app.use(sessionConfig(dbPromise));

await dbPromise;

const PORT = process.env.PORT || 3000;

app.use(express.static('dist'));

const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import api from './api.js';
app.use('/api', api);

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});