export default {
	dotenv: `
# Database
DB_HOST=localhost
DB_DIALECT=mysql
DB_DATABASE=
DB_USER=
DB_PASS=
DB_FORCE_RENEW=false

# Request
API_URL=/api
REQUEST_LIMIT=1024mb
ALLOW_ORIGIN=*

# Token
TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
TOKEN_EXPIRATION=1m
REFRESH_TOKEN_EXPIRATION=7d

# System
SYSTEM_LOGGING=false
NODE_ENV=development
    `,

	route: `
import express from 'express';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import { Routes } from './typings/RouteInterface';
import a from '../middlewares/wrapper/a';
import { OkResponse } from './typings/BodyBuilderInterface';
import { PaginatedResult } from './typings/QueryInterface';
import sequelize from 'sequelize';
import { Parser } from '../helpers/Parser';
import NotFoundError from '../classes/NotFoundError';
import { $model$Instance, $model$Attributes } from '../models/$model$';

const $model_v$sRoutes: Routes = (
    app: express.Application,
    models: ModelFactoryInterface,
): express.Router => {
    const router: express.Router = express.Router();

    router.get(
        '/',
        Parser.validateQ(),
        a(
            async (req: express.Request, res: express.Response): Promise<void> => {
                const parsed: sequelize.FindOptions<$model$Instance> = Parser.parseQuery<$model$Instance>(
                    req.query.q,
                    models,
                );
                const data: PaginatedResult<$model$Instance> = await models.$model$.findAndCountAll(parsed);
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
                const $model_v$: $model$Instance | null = await models.$model$.findByPk(id);
                if (!$model_v$) throw new NotFoundError('$model$ tidak ditemukan');
                const body: OkResponse = { data: $model_v$ };

                res.json(body);
            },
        ),
    );

    router.post(
        '/',
        // validation,
        a(
            async (req: express.Request, res: express.Response): Promise<void> => {
                const attributes: $model$Attributes = req.body;
                const $model_v$: $model$Instance = await models.$model$.create(attributes);
                const body: OkResponse = { data: $model_v$ };

                res.json(body);
            },
        ),
    );

    router.put(
        '/:id',
        // validation,
        a(
            async (req: express.Request, res: express.Response): Promise<void> => {
                const { id }: any = req.params;
                const attributes: $model$Attributes = req.body;
                const $model_v$: $model$Instance | null = await models.$model$.findByPk(id);
                if (!$model_v$) throw new NotFoundError('$model$ tidak ditemukan');
                const updated$model$: $model$Instance = await $model_v$.update(attributes);
                const body: OkResponse = { data: updated$model$ };

                res.json(body);
            },
        ),
    );

    router.delete(
        '/:id',
        a(
            async (req: express.Request, res: express.Response): Promise<void> => {
                const { id }: any = req.params;
                const $model_v$: $model$Instance | null = await models.$model$.findByPk(id);
                if (!$model_v$) throw new NotFoundError('$model$ tidak ditemukan');
                await $model_v$.destroy();
                const body: OkResponse = { data: $model_v$ };

                res.json(body);
            },
        ),
    );

    return router;
};

export default $model_v$sRoutes;
    `,

	validation: `
import express from 'express';
import { checkSchema } from 'express-validator/check';
import wrapValidation from '../middlewares/validation/request';

export const create$model$: express.Handler[] = wrapValidation(
	checkSchema({
	}),
);

export const edit$model$: express.Handler[] = wrapValidation(
	checkSchema({
	}),
);
    `,
};