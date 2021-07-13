import express from 'express';
import AuthError from '../../classes/AuthError';
import a from '../wrapper/a';

function onlyAuth(): express.Handler {
	return a(
		async (
			req: express.Request,
			res: express.Response,
			next: express.NextFunction,
		): Promise<void> => {
			if (!req.user) {
				throw new AuthError();
			} else next();
		},
	);
}

export default onlyAuth;
