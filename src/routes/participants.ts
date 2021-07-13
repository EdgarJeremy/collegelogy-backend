import express from 'express';
// @ts-ignore
import randomize from 'randomize';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import { Routes } from './typings/RouteInterface';
import a from '../middlewares/wrapper/a';
import { OkResponse } from './typings/BodyBuilderInterface';
import { ParticipantAttributes, ParticipantInstance } from '../models/Participant';
import NotFoundError from '../classes/NotFoundError';
import { PaginatedResult } from './typings/QueryInterface';
import sequelize from 'sequelize';
import { Parser } from '../helpers/Parser';
import onlyAuth from '../middlewares/protector/auth';

const participantsRoute: Routes = (
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
                const parsed: sequelize.FindOptions<ParticipantInstance> = Parser.parseQuery<ParticipantInstance>(
                    req.query.q,
                    models,
                );
                // if (req.user.type === 'lecturer') {
                //     parsed.include = [...parsed.include!, {
                //         model: models.User,
                //         as: 'student',
                //         include: [{
                //             model: models.Document,
                //         }]
                //     }]
                // }
                const data: PaginatedResult<ParticipantInstance> = await models.Participant.findAndCountAll(parsed);
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
                const participant: ParticipantInstance | null = await models.Participant.findOne({ where: { id } });
                if (!participant) throw new NotFoundError('Participant tidak ditemukan');
                const body: OkResponse = { data: participant };

                res.json(body);
            },
        ),
    );

    router.post(
        '/',
        a(
            async (req: express.Request, res: express.Response): Promise<void> => {
                const data: ParticipantAttributes = req.body;
                const participant: ParticipantInstance = await models.Participant.create(data);
                const body: OkResponse = { data: participant };

                res.json(body);
            },
        ),
    );

    router.put(
        '/:id',
        a(
            async (req: express.Request, res: express.Response): Promise<void> => {
                const { id }: any = req.params;
                const data: ParticipantAttributes = req.body;
                const participant: ParticipantInstance | null = await models.Participant.findOne({ where: { id } });
                if (!participant) throw new NotFoundError('Participant tidak ditemukan');
                await participant.update(data);
                const body: OkResponse = { data: participant };

                res.json(body);
            },
        ),
    );

    router.delete(
        '/:id',
        a(
            async (req: express.Request, res: express.Response): Promise<void> => {
                const { id }: any = req.params;
                const participant: ParticipantInstance | null = await models.Participant.findOne({ where: { id } });
                if (!participant) throw new NotFoundError('Participant tidak ditemukan');
                await participant.destroy();
                const body: OkResponse = { data: participant };

                res.json(body);
            },
        ),
    );

    return router;
};

export default participantsRoute;
