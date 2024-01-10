import { Schema, model } from "mongoose";

interface User {
    name: string;
    hash: string;
    salt: string;
    created: Date;
    guest: boolean;
}

const userSchema = new Schema<User>({
    name: {
        type: String,
        required: true,
        unique: true,
        collation: {
            locale: 'en',
            strength: 2
        }
    },
    hash: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    guest: {
        type: Boolean,
        default: false,
    }
});

const User = model<User>('User', userSchema);

export default User;