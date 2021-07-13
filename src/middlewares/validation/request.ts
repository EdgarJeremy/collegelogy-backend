import express from 'express';
import { ErrorResponse } from '../../routes/typings/BodyBuilderInterface';
import { ValidationChain, Result, validationResult } from 'express-validator/check';

export interface WrapValidationFactory {
	(schema: ValidationChain[]): express.Handler[];
}

const wrapValidation: WrapValidationFactory = (schema: ValidationChain[]): express.Handler[] => {
	return [
		...schema,
		(req: express.Request, res: express.Response, next: express.NextFunction): void => {
			const errors: Result = validationResult(req);
			if (!errors.isEmpty()) {
				const response: ErrorResponse = { errors: errors.array() };
				res.status(400);
				res.json(response);
			} else next();
		},
	];
};

export default wrapValidation;
