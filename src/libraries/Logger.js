import { transports, createLogger, format } from 'winston';
import moment from 'moment';
import chalk from 'chalk';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';


const dateFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
const colors = {
	timestamp: chalk.blue,
	debug: chalk.magentaBright.bold,
	info: chalk.cyanBright.bold,
	warn: chalk.yellowBright.bold,
	error: chalk.redBright.bold,
	errorMessage: chalk.red
};

const logsDir = resolve(__dirname, '../../logs');
if (!existsSync(logsDir)) {
	mkdirSync(logsDir);
}

const logger = createLogger({
	format: format.combine(
		format.timestamp()
	),
	transports: [
		new transports.File({
			filename: 'logs/error.log',
			level: 'error',
			format: format.printf(info => {
				return `[${moment(info.timestamp).format(dateFormat)}] `
					+ `Event code: ${info.eventCode || 'x'}\n${info.message}\n`;
			})
		}),
		new transports.File({
			filename: 'logs/app.log',
			level: 'info',
			format: format.printf(info => {
				return `[${moment(info.timestamp).format(dateFormat)}] `
					+ `[${info.level.toUpperCase()}] ${info.message}`;
			})
		})
	]
});

logger.appError = err => {
	logger.error(err.fullStack || err.stack, err);
};

if (process.env.NODE_ENV !== 'production'
	|| process.env.ENABLE_DEBUG_LOG === 'true') {
	logger.add(new transports.Console({
		level: 'debug',
		format: format.printf(info => {
			let level = info.level.toUpperCase();
			while (level.length < 5) {
				level += ' ';
			}

			return [
				colors.timestamp(moment(info.timestamp).format(dateFormat)),
				colors[info.level](level),
				info.message
			].join('  ');
		})
	}));
}

export default logger;