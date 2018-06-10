export async function getSchedule(req, res, next) {
	const { CalendarService } = req.ioc.cradle;
	const userId = req.swagger.params.userId.value;

	try {
		res.json(await CalendarService.getSchedule(userId));
	} catch (err) {
		next(err);
	}
}

export async function addActivity(req, res, next) {
	const { CalendarService } = req.ioc.cradle;
	const userId = req.swagger.params.userId.value;
	const {start, duration, title} = req.swagger.params.activity.value;

	try {
		res.json(await CalendarService.addActivity(userId, start, duration, title));
	} catch (err) {
		next(err);
	}
}

export async function editActivity(req, res, next) {
	const { CalendarService } = req.ioc.cradle;
	const calendarId = req.swagger.params.calendarId.value;
	const {start, duration, title} = req.swagger.params.activity.value;

	try {
		res.json(await CalendarService.editActivity(calendarId, start, duration, title));
	} catch (err) {
		next(err);
	}
}