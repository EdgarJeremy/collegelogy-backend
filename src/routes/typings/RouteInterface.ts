import express, { Request } from 'express';
import ModelFactoryInterface from '../../models/typings/ModelFactoryInterface';
import { UserInstance } from '../../models/User';

export interface Routes {
	(app: express.Application, models: ModelFactoryInterface): express.Router;
}

export interface A {
	(handler: express.Handler): express.Handler;
}

export interface ObjectKeyValue {
	[s: string]: any;
}
