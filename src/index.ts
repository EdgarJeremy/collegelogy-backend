/** import modules */
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import nocache from 'nocache';
import cors from 'cors';
import path from 'path';
import http from 'http';
import socketio from 'socket.io';
import _ from 'lodash';
import fs from 'fs';

import ModelFactoryInterface from './models/typings/ModelFactoryInterface';
import createModels from './models';
import createRoutes, { SiriusRouter } from './routes';
import tokenMiddleware from './middlewares/pipes/token';
import websocket from './websocket';
import { PlagiarismChecker } from './helpers/PlagiarismChecker';
import a from './middlewares/wrapper/a';
import NotFoundError from './classes/NotFoundError';

/** import .env file configuration */
dotenv.config();

/** app variables */
const app: express.Application = express();
const web: http.Server = new http.Server(app);
const io: socketio.Server = socketio(web);
const models: ModelFactoryInterface = createModels();
const allowOrigins: string | string[] = process.env.ALLOW_ORIGIN
	? process.env.ALLOW_ORIGIN === '*'
		? '*'
		: process.env.ALLOW_ORIGIN.split(',').map((origin: string) => origin.trim())
	: `http://localhost:${process.env.PORT || 1234}`;

/** setup websocket */
websocket(io);

/** middlewares */
app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '1024mb' }));
app.use(bodyParser.urlencoded({ limit: process.env.REQUEST_LIMIT || '1024mb', extended: true }));
app.use(cors({ origin: allowOrigins, credentials: true }));
app.use(tokenMiddleware(models)); // token auth
app.use(nocache()); // no cache

app.set('ROOT_DIR', path.resolve(__dirname, '..'));

/** router configuration */
const routes: SiriusRouter[] = createRoutes(app, models, io);
const apiURL: string = process.env.API_URL ? process.env.API_URL : '/api';
let routeData: any = {};

/** extract route data */
routes.forEach((route: SiriusRouter) => {
	const key: string = `${apiURL}/${route.basepoint}`;
	routeData[key] = { endpoints: [] };
	route.stack.forEach((info: any) => {
		let { route }: { route: any } = info;
		if (route) {
			let endpoint: string = route.path;
			let verbs: any = route.methods.get
				? 'GET'
				: route.methods.post
					? 'POST'
					: route.methods.put
						? 'PUT'
						: 'DELETE';
			let keys: any = info.keys.map((t: any) => t.name);
			routeData[key].endpoints.push({ endpoint, verbs, keys });
		}
	});
});

/** meta route for inspector */
app.get(
	'/app_meta',
	(req: express.Request, res: express.Response): void => {
		let data: { routes: any[]; models: any[] } = { routes: [], models: [] };
		Object.keys(routeData).forEach((route: any) => {
			data.routes.push({
				basepoint: route,
				endpoints: routeData[route].endpoints,
			});
		});
		Object.keys(models).forEach((modelName: string) => {
			if (['sequelize', 'Sequelize'].indexOf(modelName) === -1) {
				data.models.push({
					name: modelName,
					basepoint: models[modelName].getTableName(),
					attributes: models[modelName].rawAttributes,
				});
			}
		});
		res.json(data);
	},
);

app.get(
	'/document/:id',
	a(
		async (req: express.Request, res: express.Response) => {
			const { id } = req.params;
			const document = await models.Document.findByPk(id);
			if (!document) throw new NotFoundError('Dokumen tidak ditemukan');


			const sp = document.name.split('.');
			const ext = sp[sp.length - 1];
			const tempDir = path.resolve(app.get('ROOT_DIR'), 'temp');
			const name = document.name.split('.')[0] + '_' + (new Date()).getTime() + '.' + ext;
			const tempFile = path.resolve(tempDir, name);
			fs.writeFileSync(tempFile, document.file);

			res.download(tempFile, () => {
				fs.unlinkSync(tempFile);
			});
		}
	)
)

app.get(
	'/task_document/:id',
	a(
		async (req: express.Request, res: express.Response) => {
			const { id } = req.params;
			const task = await models.Task.findByPk(id);
			if (!task) throw new NotFoundError('Task tidak ditemukan');


			const sp = task.filename.split('.');
			const ext = sp[sp.length - 1];
			const tempDir = path.resolve(app.get('ROOT_DIR'), 'temp');
			const name = task.filename.split('.')[0] + '_' + (new Date()).getTime() + '.' + ext;
			const tempFile = path.resolve(tempDir, name);
			fs.writeFileSync(tempFile, task.file);

			res.download(tempFile, () => {
				fs.unlinkSync(tempFile);
			});
		}
	)
)

/** root route */
if (process.env.NODE_ENV === 'development') {
	app.use(express.static(path.resolve(__dirname, '..', 'inspector')));
} else {
	app.use(express.static(path.resolve(__dirname, '..', 'frontend')));
}



const checker = async () => {
	const c = new PlagiarismChecker(models);
	await c.check();
	setTimeout(checker, 5000);
}

/** sync models & start server */
models.sequelize
	.sync({
		force: process.env.DB_FORCE_RENEW === 'true',
		alter: false,
	})
	.then(
		(): void => {
			web.listen(
				process.env.PORT || 1234,
				(): void => {
					console.log('App running');
					checker();
				},
			);
		},
	);
