import { AppError } from '../error';


export default class CalendarService {

    static NAME = 'CalendarService';
    
	constructor({
        User,
        Calendar
	}) {
		this._user = User;
		this._calendar = Calendar;
    }
    
    async getSchedule(userId) {
        try {
            const schedule = await this._calendar.findAll({
                where: {
                    userId: userId
                },
                order: [
                    ['start', 'ASC'],
                ],
            })
            return schedule;
        }catch(err) {
            if (err instanceof AppError) {
				throw err;
			} else {
				throw new AppError('Could not get schedule', err);
			}
        }
    }

    async addActivity(userId, start, duration, title) {
        try {
            this._calendar.create({
                userId: userId,
                start: start,
                duration: duration,
                title: title
            })

            return ({
                success: true
            });
        } catch(err) {
            if (err instanceof AppError) {
				throw err;
			} else {
				throw new AppError('Could not edit activity', err);
			}
        }
    }

    async editActivity(calendarId, start, duration, title) {
        try {
            const activity = await this._calendar.findOne({
                where: {
                    calendarId: calendarId
                }
            })


           await activity.update({
               start: start,
               duration: duration,
               title: title
           })

           return ({
                success: true
            });

        } catch(err) {
            if (err instanceof AppError) {
				throw err;
			} else {
				throw new AppError('Could not edit activity', err);
			}
        }
    }


}
