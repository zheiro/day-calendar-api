/* eslint no-console: 0 */

import '@babel/polyfill';
import { createPromptModule } from 'inquirer';
import chalk from 'chalk';
import { db, models } from '../src/models';
import { CryptoUtil } from '../src/utils';

let prompt = createPromptModule();

(async () => {
	console.log(chalk.bgRedBright.whiteBright('WARNING                                             '));
	console.log(chalk.bgRed.whiteBright('You are about to rebuild the database.              '));

	const { confirm } = await prompt([
		{
			type: 'list',
			name: 'confirm',
			message: 'Are you sure you want to continue?',
			choices: [
				{ name: 'No, cancel and keep the database untouched', value: false },
				{ name: 'Yes, wipe out all data and rebuild the database', value: true }
			]
		},
	]);

	if (confirm) {
		const { User, Calendar } = models;

		console.log(chalk.cyan('[1/3]') + ' Dropping tables...');
		await db.query('SET FOREIGN_KEY_CHECKS=0;');
		await db.drop();

		console.log(chalk.cyan('[2/3]') + ' Creating tables...');
		await db.sync();
		await db.query('SET FOREIGN_KEY_CHECKS=1;');

		console.log(chalk.cyan('[3/3]') + ' Creating initial data...');

		const { hash, salt } = CryptoUtil.hashPassword('password');

		await User.create({
			email: 'kabesino@gmail.com',
			password: hash,
			salt: salt
		}) 

		await Calendar.bulkCreate([
			{
				userId: 1,
				start: 0,
				duration: 15,
				title: "Exercise"
			},
			{
				userId: 1,
				start: 25,
				duration: 30,
				title: "Travel to work"
			},
			{
				userId: 1,
				start: 30,
				duration: 30,
				title: "Review yesterday's commits"
			},
			{
				userId: 1,
				start: 60,
				duration: 15,
				title: "Code Review"
			},
			{
				userId: 1,
				start: 180,
				duration: 90,
				title: "Have Lunch with John"
			},
			{
				userId: 1,
				start: 290,
				duration: 60,
				title: 'Doing something in the middle'
			},
			{
				userId: 1,
				start: 360,
				duration: 30,
				title: "Skype Call"
			},
			{
				userId: 1,
				start: 370,
				duration: 45,
				title: "Follow up with designer"
			},
			{
				userId: 1,
				start: 405,
				duration: 30,
				title: "Push up branch"
			}
		])
	}
})()
	.then(() => process.exit(0))
	.catch(err => {
		console.log(chalk.bgRed.whiteBright('An error occurred'));
		console.log(chalk.red(err.fullStack || err.stack));
		process.exit(1);
	});