import express from 'express';
import fs from 'fs';
import socketio from 'socket.io';

import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';

export interface RouteList {
	(app: express.Application, models: ModelFactoryInterface, io: socketio.Server): SiriusRouter[];
}
export interface SiriusRouter extends express.Router {
	basepoint: string;
}

const createRoutes: RouteList = (
	app: express.Application,
	models: ModelFactoryInterface,
	io: socketio.Server,
): SiriusRouter[] => {
	const routes: string[] = fs
		.readdirSync(__dirname)
		.filter(
			(fileName: string) =>
				fileName !== 'typings' &&
				fileName !== 'index.ts' &&
				fileName !== 'index.js' &&
				fileName.indexOf('.validation.') === -1,
		);

	const routeList: SiriusRouter[] = [];
	const apiURL: string = process.env.API_URL ? process.env.API_URL : '/api';

	routes.forEach((route: string) => {
		route = route.replace('.ts', '');
		route = route.replace('.js', '');
		const router: any = require(`./${route}`).default;
		if (typeof router === 'function') {
			const routerHandler: SiriusRouter = router(app, models, io);
			routerHandler.basepoint = route;
			app.use(`${apiURL}/${route}`, routerHandler);
			routeList.push(routerHandler);
		}
	});

	return routeList;
};

export default createRoutes;
