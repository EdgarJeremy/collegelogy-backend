import express from 'express';
import randomize from 'randomatic';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import { Routes } from './typings/RouteInterface';
import a from '../middlewares/wrapper/a';
import { OkResponse } from './typings/BodyBuilderInterface';
import { RoomAttributes, RoomInstance } from '../models/Room';
import NotFoundError from '../classes/NotFoundError';
import { PaginatedResult } from './typings/QueryInterface';
import sequelize from 'sequelize';
import { Parser } from '../helpers/Parser';
import onlyAuth from '../middlewares/protector/auth';

const roomsRoute: Routes = (
	app: express.Application,
	models: ModelFactoryInterface,
): express.Router => {
	const router: express.Router = express.Router();

	router.use(onlyAuth());

	router.get(
		'/',
		Parser.validateQ(),
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const parsed: sequelize.FindOptions<RoomInstance> = Parser.parseQuery<RoomInstance>(
					req.query.q,
					models,
				);
				parsed.distinct = true;
				parsed.attributes = ['id', 'name', 'code', 'created_at'];
				if (req.user.type === 'lecturer') {
					parsed.where = { ...parsed.where, owner_id: req.user.id };
					parsed.include = [...parsed.include!, { model: models.Participant }, { model: models.Task }];
				} else {
					parsed.include = [...parsed.include!, {
						attributes: ['id'],
						model: models.Participant,
						where: { student_id: req.user.id! },
						required: true
					}, { model: models.Task }, { model: models.User, as: 'owner' }];
				}
				const data: PaginatedResult<RoomInstance> = await models.Room.findAndCountAll(parsed);
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
				const room: RoomInstance | null = await models.Room.findOne({ where: { id } });
				if (!room) throw new NotFoundError('Kelas tidak ditemukan');
				const body: OkResponse = { data: room };

				res.json(body);
			},
		),
	);

	router.post(
		'/:code/join',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { code } = req.params;
				const room: RoomInstance | null = await models.Room.findOne({ where: { code } });
				if (!room) throw new NotFoundError('Kelas tidak ditemukan');
				const participant = await models.Participant.findOne({ where: { student_id: req.user.id, room_id: room.id } });
				if (participant) throw new NotFoundError('Anda sudah bergabung dengan kelas ini!');
				const p = await models.Participant.create({
					student_id: req.user.id,
					room_id: room.id
				});
				const body: OkResponse = { data: room };

				res.json(body);
			}
		)
	)

	router.post(
		'/',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const data: RoomAttributes = req.body;
				data.owner_id = req.user.id;
				data.code = randomize('A0', 6);
				const room: RoomInstance = await models.Room.create(data);
				const body: OkResponse = { data: room };

				res.json(body);
			},
		),
	);

	router.put(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const data: RoomAttributes = req.body;
				const room: RoomInstance | null = await models.Room.findOne({ where: { id } });
				if (!room) throw new NotFoundError('Kelas tidak ditemukan');
				await room.update(data);
				const body: OkResponse = { data: room };

				res.json(body);
			},
		),
	);

	router.delete(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const room: RoomInstance | null = await models.Room.findOne({ where: { id } });
				if (!room) throw new NotFoundError('Kelas tidak ditemukan');
				await room.destroy();
				const body: OkResponse = { data: room };

				res.json(body);
			},
		),
	);

	return router;
};

export default roomsRoute;
