import sequelize from 'sequelize';
import express from 'express';
import ModelFactoryInterface from '../models/typings/ModelFactoryInterface';
import wrapValidation from '../middlewares/validation/request';
import { checkSchema } from 'express-validator/check';

export interface ICollectionOptions {
	distinct?: boolean;
	limit?: number;
	offset?: number;
	attributes?: string[];
	as?: string;
	include?: ICollectionIncludeOptions[];
	order?: string[] | string[][];
	where?: any;
	group?: string | string[];
}

interface ICollectionIncludeOptions extends ICollectionOptions {
	model: string;
	required: boolean;
}

export class Parser {
	public static parseQuery<T>(q: string, models: ModelFactoryInterface): sequelize.FindOptions<T> {
		const raw: ICollectionOptions = JSON.parse(Buffer.from(q, 'base64').toString());
		const parsed: sequelize.FindOptions<T> = {
			distinct: raw.distinct,
			attributes: this.buildAttributes(raw.attributes),
			limit: raw.limit,
			offset: raw.offset,
			order: raw.order,
			where: raw.where,
			include: this.buildIncludes(raw.include, models),
			group: raw.group,
			// @ts-ignore
			as: raw.as,
		};

		return parsed;
	}

	private static buildIncludes(
		include: ICollectionIncludeOptions[] | undefined,
		models: ModelFactoryInterface,
	): (sequelize.Model<any, any> | sequelize.IncludeOptions)[] {
		return include
			? include.map((m: ICollectionIncludeOptions) => ({
				model: models[m.model],
				attributes: this.buildAttributes(m.attributes),
				where: m.where,
				limit: m.limit,
				offset: m.offset,
				order: m.order,
				include: this.buildIncludes(m.include, models),
				as: m.as,
				required: m.required
			}))
			: [];
	}

	private static buildAttributes(
		rawAttributes: ICollectionOptions['attributes'],
	): sequelize.FindOptionsAttributesArray {
		return rawAttributes
			? rawAttributes.map((f: string) => {
				const o: string[] = f.split(':');
				if (o.length > 1) {
					return sequelize.fn(o[0], o[1]);
				} else {
					return f;
				}
			})
			: [];
	}

	public static validateQ(): express.Handler[] {
		return wrapValidation(
			checkSchema({
				q: {
					in: 'query',
					custom: {
						options: (value: string): boolean => {
							try {
								const raw: any = JSON.parse(Buffer.from(value, 'base64').toString());
								return true;
							} catch (e) {
								return false;
							}
						},
						errorMessage: 'Query tidak valid',
					},
				},
			}),
		);
	}
}