import express from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import { Routes } from './typings/RouteInterface';
import a from '../middlewares/wrapper/a';
import { OkResponse } from './typings/BodyBuilderInterface';
import { TaskAttributes, TaskInstance } from '../models/Task';
import NotFoundError from '../classes/NotFoundError';
import { PaginatedResult } from './typings/QueryInterface';
import sequelize from 'sequelize';
import { Parser } from '../helpers/Parser';
import onlyAuth from '../middlewares/protector/auth';
import SiriusError from '../classes/SiriusError';
import AuthError from '../classes/AuthError';
import { RoomInstance } from '../models/Room';

const tasksRoute: Routes = (
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
				const parsed: sequelize.FindOptions<TaskInstance> = Parser.parseQuery<TaskInstance>(
					req.query.q,
					models,
				);
				parsed.distinct = true;
				parsed.attributes = ['id', 'name', 'description', 'due_date', 'filename', [models.Sequelize.literal('CASE WHEN task.file IS NULL THEN false ELSE true END'), 'hasFile']];
				if (req.user.type === 'student') {
					parsed.include = [...parsed.include!, {
						attributes: ['id'],
						model: models.Document,
						include: [{
							attributes: ['id'],
							model: models.Participant,
							include: [{
								attributes: ['id'],
								model: models.User,
								as: 'student',
								where: { id: req.user.id! },
								required: true
							}],
							required: true
						}]
					}]
				}
				const data: PaginatedResult<TaskInstance> = await models.Task.findAndCountAll(parsed);
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
				const task: TaskInstance | null = await models.Task.findOne({ where: { id } });
				if (!task) throw new NotFoundError('Task tidak ditemukan');
				const body: OkResponse = { data: task };

				res.json(body);
			},
		),
	);

	router.post(
		'/',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const data: TaskAttributes = req.body;
				const s = models.Sequelize;
				const exists = await models.Task.findOne({
					where: s.and(
						s.where(
							s.fn('LOWER', s.col('name')),
							data.name.toLowerCase()
						),
						s.where(s.col('room_id'), data.room_id!)
					)
				});
				if (exists) throw new AuthError('Judul tugas sudah pernah dibuat!');
				if (data.file) {
					// @ts-ignore
					const sp = data.file.name.split('.');
					const ext: string = sp[sp.length - 1];
					if (['jpg', 'jpeg', 'png', 'bmp', 'pdf', 'docx'].indexOf(ext) === -1) throw new SiriusError('Format tidak didukung');
					const tempDir = path.resolve(app.get('ROOT_DIR'), 'temp');
					const name = 'temp_doc_' + (new Date()).getTime() + '.' + ext;
					const tempFile = path.resolve(tempDir, name);
					// @ts-ignore
					const file = Buffer.from(data.file.data, 'base64');
					fs.writeFileSync(tempFile, file);

					// @ts-ignore
					data.filename = data.file.name;
					// @ts-ignore
					data.file = file;

					fs.unlinkSync(tempFile);
				}

				const task: TaskInstance = await models.Task.create(data);
				const room: RoomInstance | null = await models.Room.findOne({
					attributes: ['name'],
					where: {
						id: data.room_id
					},
					include: [{
						model: models.Participant,
						include: [{
							attributes: ['username'],
							as: 'student',
							model: models.User
						}]
					}]
				});
				if (!room) throw new NotFoundError(`Kelas tidak ditemukan`);
				// @ts-ignore
				const emails: string[] = room.participants.map((p) => p.student.username);
				const transporter = nodemailer.createTransport({
					host: 'smtp.gmail.com',
					port: 587,
					auth: {
						user: process.env.SMTP_EMAIL,
						pass: process.env.SMTP_PASSWORD
					}
				});
				const info = await transporter.sendMail({
					from: `"CollegeLogy" <collegelogy@gmail.com>`,
					to: emails.join(', '),
					subject: 'Pemberitahuan Tugas Baru',
					text: `Tugas baru telah dibuat di kelas ${room.name} dengan judul ${task.name}! Silakan buka aplikasi CollegeLogy.`
				});

				const body: OkResponse = { data: task };

				res.json(body);
			},
		),
	);

	router.put(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const data: TaskAttributes = req.body;
				const task: TaskInstance | null = await models.Task.findOne({ where: { id } });
				if (!task) throw new NotFoundError('Task tidak ditemukan');
				await task.update(data);
				const body: OkResponse = { data: task };

				res.json(body);
			},
		),
	);

	router.delete(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const task: TaskInstance | null = await models.Task.findOne({ where: { id } });
				if (!task) throw new NotFoundError('Task tidak ditemukan');
				await task.destroy();
				const body: OkResponse = { data: task };

				res.json(body);
			},
		),
	);

	return router;
};

export default tasksRoute;
