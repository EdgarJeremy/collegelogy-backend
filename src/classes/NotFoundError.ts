import SiriusError from './SiriusError';

export default class NotFoundError extends SiriusError {
	name: string = 'NotFoundError';
	code: number = 404;
	message: string = 'Resource tidak ditemukan';

	constructor(message?: string) {
		super(message);
		this.message = message!;
	}
}
