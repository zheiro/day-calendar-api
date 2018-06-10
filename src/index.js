import 'source-map-support/register';
import '@babel/polyfill';

const startupStartTime = new Date().getTime();

import express from 'express';
import bodyParser from 'body-parser';
import { safeLoad } from 'js-yaml';
import { initializeMiddleware } from 'swagger-tools';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { createServer } from 'http';
import { createContainer, asValue } from 'awilix';
import secureRandom from 'secure-random';

import { Logger } from './libraries';
import { initializeModels } from './models';
import { initializeServices } from './services';
import { InvalidParameterError } from './error';


const app = express();
const server = createServer(app);
const port = process.env.PORT || 5050;
const swaggerOptions = {
	controllers: resolve(__dirname, './controllers'),
	useStubs: !!process.env.MOCK_MODE
};

Logger.info(`[app] Environment: ${process.env.NODE_ENV || 'development'}`);
if (!!process.env.DISABLE_OTP_API) {
	Logger.info('[app] OTP and SMS APIs are disabled; no messages will be sent');
}

// Load Swagger definition
Logger.info('[app] Loading API definition...');
const spec = safeLoad(readFileSync(resolve(__dirname, '../api/spec.yaml')));
Logger.info('[app] API definition loaded. Starting Web application...');

initializeMiddleware(spec, middleware => {

	// Generate JWT secret
	app.set('secret', secureRandom(16, { type: 'Buffer' }));

	// Add body parser for JSON and URL-encoded data
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded());

	// CORS stuff
	app.use('/api', (req, res, next) => {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		if (req.method === 'OPTIONS') {
			res.end();
		} else {
			next();
		}
	});

	// Initialize IoC container
	const appIoc = createContainer();
	appIoc.register('App', asValue(app));
	appIoc.register('Logger', asValue(Logger));
	initializeModels(appIoc);
	initializeServices(appIoc);
	app.use((req, res, next) => {
		req.ioc = appIoc;
		next();
	});

	// Initialize Swagger middleware
	app.use(middleware.swaggerMetadata());
	app.use(middleware.swaggerValidator());
	app.use(middleware.swaggerRouter(swaggerOptions));
	app.use(middleware.swaggerUi());


	// Handle 404
	app.use((req, res) => {
		if (req.path.indexOf('.websocket') === -1) {
			res.status(404).json({
				error: 'The specified resource/endpoint does not exist.',
				path: req.path
			});
		}
	});

	// Handle errors
	app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
		Logger.appError(err);
		if (err instanceof InvalidParameterError) {
			res.status(400).json({
				error: err.message,
				eventCode: err.eventCode,
				validationErrors: err.validationErrors
			});
		} else {
			res.status(err.httpStatus || 500).json({
				error: err.name,
				message: err.message,
				eventCode: err.eventCode
			});
		}
	});

	// Start app
	server.listen(5050, err => {
		if (!err) {
			const startupTime =
				(new Date().getTime() - startupStartTime) / 1000;
			Logger.info(`[app] Web application running on port ${port}`);
			Logger.info(`[app] Startup took ${startupTime.toFixed(2)} seconds`);
		} else {
			Logger.appError(err);
		}
	});

});