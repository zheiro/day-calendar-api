import AppError from './AppError';


export default class NotFoundError extends AppError {

	name = 'NotFoundError';


	constructor(message) {
		super(message, null, 404);
	}

}