import express from 'express';
import { checkSchema } from 'express-validator/check';
import wrapValidation from '../middlewares/validation/request';

export const createUser: express.Handler[] = wrapValidation(
	checkSchema({
		name: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Nama harus diisi',
				negated: true,
			},
		},
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

export const editUser: express.Handler[] = wrapValidation(
	checkSchema({
		name: {
			in: 'body',
			isEmpty: {
				errorMessage: 'Nama harus diisi',
				negated: true,
			},
		},
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
