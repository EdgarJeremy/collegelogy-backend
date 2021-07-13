import express from 'express';
import { ErrorResponse, ErrorItem } from '../../routes/typings/BodyBuilderInterface';
import Sequelize from 'sequelize';
import { A } from '../../routes/typings/RouteInterface';
import SiriusError from '../../classes/SiriusError';

const a: A = (handler: express.Handler): express.Handler => {
	return (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction,
	): Promise<express.Handler> => {
		return Promise.resolve(handler(req, res, next)).catch(
			(
				err:
					| Error
					| SiriusError
					| Sequelize.UniqueConstraintError
					| Sequelize.ValidationError
					| any,
			) => {
				if (err instanceof Sequelize.UniqueConstraintError) {
					const response: ErrorResponse = { errors: extractErrorResponse(err) };
					res.status(422);
					res.json(response);
				} else if (err instanceof Sequelize.ValidationError) {
					const response: ErrorResponse = { errors: extractErrorResponse(err) };
					res.status(422);
					res.json(response);
				} else {
					const response: ErrorResponse = { errors: [{ msg: err.message }] };
					res.status(err.code ? err.code : 500);
					res.json(response);
				}
			},
		);
	};
};

const extractErrorResponse: Function = (
	err: Sequelize.UniqueConstraintError | Sequelize.ValidationError,
): ErrorResponse => {
	const errors: ErrorItem[] = err.errors.map(
		(errItem: Sequelize.ValidationErrorItem): ErrorItem => ({
			param: errItem.path,
			msg: errItem.message,
		}),
	);

	return { errors };
};

export default a;
