import express from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

import { UserInstance } from '../../models/User';
import ModelFactoryInterface from '../../models/typings/ModelFactoryInterface';
import { TokenInstance } from '../../models/Token';
import { ObjectKeyValue } from '../../routes/typings/RouteInterface';

export interface TokenMiddleware {
	(models: ModelFactoryInterface): express.Handler;
}
export interface TokenStructureResponse {
	token: string;
	refreshToken: string;
	user?: UserInstance;
}
export interface GenerateTokensInterface {
	(id: number, models: ModelFactoryInterface): Promise<TokenStructureResponse | ObjectKeyValue>;
}
export interface GenerateNewTokensInterface {
	(refreshToken: string, models: ModelFactoryInterface): Promise<
		TokenStructureResponse | ObjectKeyValue
	>;
}
export interface TokenConfigurationInterface {
	tokenSecret: string;
	refreshTokenSecret: string;
	tokenExpiration: string;
	refreshTokenExpiration: string;
}

export const getTokenConfiguration: Function = (): TokenConfigurationInterface => {
	return {
		tokenSecret: process.env.TOKEN_SECRET ? process.env.TOKEN_SECRET : '',
		refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET ? process.env.REFRESH_TOKEN_SECRET : '',
		tokenExpiration: process.env.TOKEN_EXPIRATION ? process.env.TOKEN_EXPIRATION : '1m',
		refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION
			? process.env.REFRESH_TOKEN_EXPIRATION
			: '7d',
	};
};

export const generateTokens: GenerateTokensInterface = async (
	user_id: number,
	models: ModelFactoryInterface,
): Promise<TokenStructureResponse | ObjectKeyValue> => {
	try {
		const user: UserInstance | null = await models.User.findOne({ where: { id: user_id } });
		const {
			tokenSecret,
			refreshTokenSecret,
			tokenExpiration,
			refreshTokenExpiration,
		}: TokenConfigurationInterface = getTokenConfiguration();

		if (user) {
			let token: string = jwt.sign({ id: user.id }, tokenSecret, { expiresIn: tokenExpiration });
			let refreshToken: string = jwt.sign({ id: user.id }, refreshTokenSecret + user.password, {
				expiresIn: refreshTokenExpiration,
			});
			const tokenInstance: TokenInstance = await models.Token.create({
				refresh_token: refreshToken,
				used: false,
			});
			tokenInstance.setUser(user);
			return { token, refreshToken };
		} else return {};
	} catch (e) {
		console.log(e);
		return {};
	}
};
export const generateNewTokens: GenerateNewTokensInterface = async (
	refreshToken: string,
	models: ModelFactoryInterface,
): Promise<TokenStructureResponse | ObjectKeyValue> => {
	try {
		const payload: any = jwt.decode(refreshToken);
		const refreshSecret: string = process.env.REFRESH_TOKEN_SECRET
			? process.env.REFRESH_TOKEN_SECRET
			: '';

		if (payload) {
			const user: UserInstance | null = await models.User.findOne({
				where: payload.id,
				attributes: { include: ['password'] },
			});
			if (user && user.id) {
				let refreshKey: string = refreshSecret + user.password;
				try {
					jwt.verify(refreshToken, refreshKey);
					const newTokens: TokenStructureResponse | ObjectKeyValue = await generateTokens(
						user.id,
						models,
					);
					newTokens.user = user;
					return newTokens;
				} catch (e) {
					return {};
				}
			} else return {};
		} else return {};
	} catch (e) {
		return {};
	}
};

const tokenMiddleware: TokenMiddleware = (models: ModelFactoryInterface): express.Handler => {
	return async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction,
	): Promise<void> => {
		const token: any = req.headers['x-access-token'];
		const refreshToken: any = req.headers['x-refresh-token'];
		const { tokenSecret = '' }: TokenConfigurationInterface = getTokenConfiguration();

		if (token) {
			try {
				const payload: any = jwt.verify(token, tokenSecret);
				if (payload) {
					const user: UserInstance | null = await models.User.findOne({
						where: { id: payload.id },
					});
					if (user) {
						req.user = user;
					}
				}
			} catch (e) {
				if (e.name === 'TokenExpiredError') {
					const refreshTokenInstance: TokenInstance | null = await models.Token.findOne({
						where: { refresh_token: refreshToken },
					});
					if (refreshTokenInstance) {
						if (!refreshTokenInstance.used) {
							const newTokens:
								| TokenStructureResponse
								| ObjectKeyValue = await generateNewTokens(refreshToken, models);
							if (newTokens.token && newTokens.refreshToken) {
								res.set('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token');
								res.set('x-access-token', newTokens.token);
								res.set('x-refresh-token', newTokens.refreshToken);
								await refreshTokenInstance.update({ used: true });
								req.user = newTokens.user;
							}
						}
					}
				}
			}
		}
		next();
	};
};

export default tokenMiddleware;
