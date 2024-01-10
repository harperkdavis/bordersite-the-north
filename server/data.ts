import { connect } from 'mongoose';

const DATABASE_NAME = 'btn';
const DATABASE_URI = `${process.env.MONGO_URI || 'mongodb://localhost:27017/'}${DATABASE_NAME}`;

export default async function databasePromise() {
    return connect(DATABASE_URI).then(client => {
        console.log('Connected to database');
        return client;
    });
}