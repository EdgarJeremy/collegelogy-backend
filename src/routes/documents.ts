import express from 'express';
import fs from 'fs';
import path from 'path';
// @ts-ignore
import reader from 'any-text';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import { Routes } from './typings/RouteInterface';
import a from '../middlewares/wrapper/a';
import { OkResponse } from './typings/BodyBuilderInterface';
import { DocumentAttributes, DocumentInstance } from '../models/Document';
import NotFoundError from '../classes/NotFoundError';
import { PaginatedResult } from './typings/QueryInterface';
import sequelize from 'sequelize';
import { Parser } from '../helpers/Parser';
import onlyAuth from '../middlewares/protector/auth';
import SiriusError from '../classes/SiriusError';

const documentsRoute: Routes = (
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
				const parsed: sequelize.FindOptions<DocumentInstance> = Parser.parseQuery<DocumentInstance>(
					req.query.q,
					models,
				);
				const data: PaginatedResult<DocumentInstance> = await models.Document.findAndCountAll(parsed);
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
				const document: DocumentInstance | null = await models.Document.findOne({ where: { id } });
				if (!document) throw new NotFoundError('Document tidak ditemukan');
				const body: OkResponse = { data: document };

				res.json(body);
			},
		),
	);

	router.post(
		'/',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const data: DocumentAttributes = req.body;

				const sp = data.name.split('.');
				const ext: string = sp[sp.length - 1];
				if (['pdf', 'docx', 'doc'].indexOf(ext) === -1) throw new SiriusError('Format tidak didukung');
				const tempDir = path.resolve(app.get('ROOT_DIR'), 'temp');
				const name = 'temp_doc_' + (new Date()).getTime() + '.' + ext;
				const tempFile = path.resolve(tempDir, name);
				const file = Buffer.from(data.file, 'base64');
				fs.writeFileSync(tempFile, file);

				const content = await reader.getText(tempFile);
				data.content = content.trim();
				// @ts-ignore
				data.file = file;

				fs.unlinkSync(tempFile);

				const document: DocumentInstance = await models.Document.create(data);
				const body: OkResponse = { data: document };

				res.json(body);
			},
		),
	);

	router.put(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const data: DocumentAttributes = req.body;
				const document: DocumentInstance | null = await models.Document.findOne({ where: { id } });
				if (!document) throw new NotFoundError('Document tidak ditemukan');
				await document.update(data);
				const body: OkResponse = { data: document };

				res.json(body);
			},
		),
	);

	router.delete(
		'/:id',
		a(
			async (req: express.Request, res: express.Response): Promise<void> => {
				const { id }: any = req.params;
				const document: DocumentInstance | null = await models.Document.findOne({ where: { id } });
				if (!document) throw new NotFoundError('Document tidak ditemukan');
				await document.destroy();
				const body: OkResponse = { data: document };

				res.json(body);
			},
		),
	);

	return router;
};

export default documentsRoute;
