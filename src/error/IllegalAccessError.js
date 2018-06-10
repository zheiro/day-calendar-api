import AppError from './AppError';


export default class IllegalAccessError extends AppError {

	name = 'IllegalAccessError';

	constructor(message) {
		super(message, null, 403);
	}

}