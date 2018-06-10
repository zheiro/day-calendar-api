export async function login(req, res, next) {
	const { AuthService } = req.ioc.cradle;
	const {email, password} = req.swagger.params.credentials.value;

	try {
		res.json(await AuthService.login(email, password));
	} catch (err) {
		next(err);
	}
}

export async function register(req, res, next) {
	const { AuthService } = req.ioc.cradle;
	const {email, password} = req.swagger.params.credentials.value;

	try {
		res.json(await AuthService.register(email, password));
	} catch (err) {
		next(err);
	}
}