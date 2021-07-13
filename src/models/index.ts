import Sequelize from 'sequelize';
import ModelFactoryInterface from './typings/ModelFactoryInterface';
import { UserFactory } from './User';
import { TokenFactory } from './Token';
import { RoomFactory } from './Room';
import { ParticipantFactory } from './Participant';
import { TaskFactory } from './Task';
import { DocumentFactory } from './Document';
import { DifferenceFactory } from './Difference';

const createModels: Function = (): ModelFactoryInterface => {
	const {
		DB_HOST,
		DB_DIALECT,
		DB_DATABASE = 'sirius',
		DB_USER = 'sirius',
		DB_PASS = 'sirius',
	}: NodeJS.ProcessEnv = process.env;
	const sequelize: Sequelize.Sequelize = new Sequelize(DB_DATABASE, DB_USER, DB_PASS, {
		host: DB_HOST,
		dialect: DB_DIALECT,
		dialectOptions: {
			useUTC: true,
		},
		timezone: '+08:00',
		operatorsAliases: true,
		logging: process.env.SYSTEM_LOGGING === 'true' ? console.log : (msg: string) => { },
	});
	const db: ModelFactoryInterface = {
		sequelize,
		Sequelize,
		User: UserFactory(sequelize, Sequelize),
		Token: TokenFactory(sequelize, Sequelize),
		Room: RoomFactory(sequelize, Sequelize),
		Participant: ParticipantFactory(sequelize, Sequelize),
		Task: TaskFactory(sequelize, Sequelize),
		Document: DocumentFactory(sequelize, Sequelize),
		Difference: DifferenceFactory(sequelize, Sequelize)
	};

	Object.keys(db).forEach(
		(model: string): void => {
			if (db[model].associate) {
				db[model].associate(db);
			}
		},
	);

	return db;
};

export default createModels;
