import AppError from './AppError';


export default class InvalidParameterError extends AppError {

	name = 'InvalidParameterError';


	constructor(message) {
		super(message, null, 400);
	}

}