import { Request } from 'express';
import { UserInstance } from './src/models/User';

declare global {
    namespace Express {
        interface Request {
            user: UserInstance;
        }
    }
}