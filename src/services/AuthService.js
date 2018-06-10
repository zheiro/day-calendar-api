import { AppError, IllegalAccessError } from '../error';
import { CryptoUtil } from '../utils';

export default class AuthService {

    static NAME = 'AuthService';
    
	constructor({
        User,
	}) {
		this._user = User;
    }
    
    async login(email, password) {
        try {
            const user = await this._user.findOne({
                where: {email}
            })


            if (user && CryptoUtil.isPasswordValid(password, user)) {
                return {
                    success: true,
                    userId: user.id
                }
            } else {
                throw new IllegalAccessError('Invalid email/password combination.');
            }

        } catch(err) {
            if (err instanceof AppError) {
				throw err;
			} else {
				throw new AppError('Could not log in', err);
			}
        }
    }

    async register(email, password) {
        try {
            const { hash, salt } = CryptoUtil.hashPassword(password);

            await this._user.create({
                email: email,
                password: hash,
                salt: salt
            })

            return {
                success: true
            }

        } catch(err) {
            if (err instanceof AppError) {
				throw err;
			} else {
				throw new AppError('Could not sign up', err);
			}
        }
    }

}
