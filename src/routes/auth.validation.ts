import express from 'express';
import { checkSchema, ValidationChain } from 'express-validator/check';
import wrapValidation from '../middlewares/validation/request';

export const login: express.Handler[] = wrapValidation(
	checkSchema({
		username: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Username harus diisi',
				negated: true,
			},
		},
		password: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Password harus diisi',
				negated: true,
			},
		},
	}),
);
