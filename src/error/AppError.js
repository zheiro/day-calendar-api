import { randomBytes } from 'crypto';


export default class AppError extends Error {

	name = 'AppError';


	constructor(message, cause, httpStatus = 500) {
		super(message);
		this.message = message;
		this.cause = cause;
		this.httpStatus = httpStatus;
		this.eventCode = randomBytes(8).toString('hex');

		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = (new Error(message)).stack;
		}
	}

	get fullStack() {
		if (this.cause) {
			return this.stack + '\nCaused by: ' + (
				(this.cause.fullStack) ? this.cause.fullStack : this.cause.stack
			);
		} else {
			return this.stack;
		}
	}

}