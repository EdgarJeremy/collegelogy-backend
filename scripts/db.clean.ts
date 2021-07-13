import dotenv from 'dotenv';
import chalk from 'chalk';
import createModels from '../src/models';
import ModelFactoryInterface from '../src/models/typings/ModelFactoryInterface';

dotenv.config();

const models: ModelFactoryInterface = createModels();

console.log(chalk.cyan(`(db:clean) Sedang membarui database`));

models.sequelize
	.sync({
		force: true,
	})
	.then(() => {
		console.log(chalk.cyan(`(db:clean) Database sudah dibarukan`));
		process.exit(0);
	})
	.catch((err: Error) => {
		console.warn(err);
		process.exit(0);
	});