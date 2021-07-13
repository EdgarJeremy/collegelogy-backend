import SiriusError from './SiriusError';

export default class AuthError extends SiriusError {
	name: string = 'AuthError';
	code: number = 401;
	message: string = 'Tidak ada hak akses';

	constructor(message?: string) {
		super(message);
		this.message = message!;
	}
}
