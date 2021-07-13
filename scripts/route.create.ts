import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import pluralize from 'pluralize';
import _ from 'lodash';
import templates from './templates';
import inquirer from 'inquirer';
import createModels from '../src/models';
import ModelFactoryInterface from '../src/models/typings/ModelFactoryInterface';

dotenv.config();

const models: ModelFactoryInterface = createModels();
const route: string = templates.route;

delete models.Sequelize;
delete models.sequelize;

console.log(chalk.cyan(`(route:create) Pembuatan route baru. Silakan ikuti arahan`));

inquirer
	.prompt([
		{
			type: 'list',
			name: 'model',
			message: 'Pilih entitas basis',
			choices: Object.keys(models),
		},
	])
	.then((answers: any) => {
		const modelName: string = answers.model;
		fs.writeFileSync(
			path.resolve(
				__dirname,
				'..',
				'src',
				'routes',
				`${pluralize.plural(_.snakeCase(modelName))}.ts`,
			),
			route.replace(/\$model\$/g, modelName).replace(/\$model_v\$/g, modelName.toLowerCase()),
		);
		console.log(chalk.cyan(`(route:create) Route ${modelName} berhasil dibuat`));
		process.exit(0);
	})
	.catch((err: Error) => {
		console.warn(err);
		process.exit(0);
	});