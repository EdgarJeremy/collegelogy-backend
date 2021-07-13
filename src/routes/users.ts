import express from 'express';
import bcrypt from 'bcrypt';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import { Routes } from './typings/RouteInterface';
import a from '../middlewares/wrapper/a';
import { OkResponse } from './typings/BodyBuilderInterface';
import { UserAttributes, UserInstance } from '../models/User';
import NotFoundError from '../classes/NotFoundError';
import { createUser, editUser } from './users.validation';
import { PaginatedResult } from './typings/QueryInterface';
import sequelize from 'sequelize';
import { Parser } from '../helpers/Parser';
import onlyAuth from '../middlewares/protector/auth';

const usersRoute: Routes = (
	app: express.Application,
	models: ModelFactoryInterface,
): express.Router => {
	const router: express.Router = express.Router();

	router.get(
		'/',
		Parser.validateQ(),
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const parsed: sequelize.FindOptions<UserInstance> = Parser.parseQuery<UserInstance>(
					req.query.q,
					models,
				);
				const data: PaginatedResult<UserInstance> = await models.User.findAndCountAll(parsed);
				const body: OkResponse = { data };

				res.json(body);
			},
		),
	);

	router.get(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const user: UserInstance | null = await models.User.findOne({ where: { id } });
				if (!user) throw new NotFoundError('User tidak ditemukan');
				const body: OkResponse = { data: user };

				res.json(body);
			},
		),
	);

	router.post(
		'/',
		createUser,
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const data: UserAttributes = req.body;
				const user: UserInstance = await models.User.create({
					...data,
					password: bcrypt.hashSync(data.password, 10),
				});
				const body: OkResponse = { data: user };

				res.json(body);
			},
		),
	);

	router.put(
		'/:id',
		editUser,
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const data: UserAttributes = req.body;
				const user: UserInstance | null = await models.User.findOne({ where: { id } });
				if (!user) throw new NotFoundError('User tidak ditemukan');
				await user.update({ ...data, password: bcrypt.hashSync(data.password, 10) });
				const body: OkResponse = { data: user };

				res.json(body);
			},
		),
	);

	router.delete(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const user: UserInstance | null = await models.User.findOne({ where: { id } });
				if (!user) throw new NotFoundError('User tidak ditemukan');
				await user.destroy();
				const body: OkResponse = { data: user };

				res.json(body);
			},
		),
	);

	return router;
};

export default usersRoute;
