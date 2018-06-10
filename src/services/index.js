import { asClass, Lifetime } from 'awilix';

import CalendarService from './CalendarService';
import AuthService from './AuthService';

export function initializeServices(iocContainer) {
	const { Logger } = iocContainer.cradle;

	[
		CalendarService,
		AuthService
	].forEach(Service => {
		iocContainer.register(Service.NAME, asClass(Service, {
			lifetime: Lifetime.SINGLETON
		}));
		Logger.info(`[app] Service started: ${Service.NAME}`);
	});

}