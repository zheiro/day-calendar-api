import Sequelize from 'sequelize';
import { asValue } from 'awilix';
import User from './User';
import Calendar from './Calendar';

// const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env;

export const db = new Sequelize({
	database: 'day_calendar',
	username: 'root',
	password: 'root',
	host: 'localhost',
	dialect: 'mysql',
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	define: {
		freezeTableName: true
	},
	logging: () => null
});
export const models = {};

[
	Calendar,
	User,
].forEach(model => {
	const modelInstance = model.register(db, Sequelize);
	models[model.name] = modelInstance;
});

// RELATIONSHIPS

// User ----< Calendar
models.User.hasMany(models.Calendar, {
	as: 'calendars',
	foreignKey: 'userId'
});
models.Calendar.belongsTo(models.User, {
	as: 'user',
	foreignKey: 'userId'
})

export function initializeModels(iocContainer) {
	const { Logger } = iocContainer.cradle;

	try {
		iocContainer.register('db', asValue(db));
		Object.keys(models).forEach(modelName => {
			iocContainer.register(modelName, asValue(models[modelName]));
			Logger.info(`[app] Model loaded: ${modelName}`);
		});
	} catch (err) {
		Logger.appError(err);
	}
}