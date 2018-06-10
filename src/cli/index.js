/* eslint-disable no-console */
import '@babel/polyfill';
import { createPromptModule } from 'inquirer';
import chalk from 'chalk';

import configureSystem from './configureSystem';
import rebuildDatabase from './rebuildDatabase';
import updateSystem from './updateSystem';


const prompt = createPromptModule();

(async () => {

	console.log('');
	console.log(chalk.bgCyan.whiteBright(' Dark Knight Deployment Utility '));
	console.log('');
	console.log(chalk.bgYellowBright.red(' W A R N I N G                                      '));
	console.log(chalk.bgRed.whiteBright(' This tool is intended for deployment use only.     '));
	console.log(chalk.bgRed.whiteBright(' Improper use may result in permanent loss of data. '));
	console.log('');

	const { tool } = await prompt([
		{
			type: 'list',
			name: 'sure',
			message: 'Are you sure you want to continue?',
			choices: [
				{ name: 'No', value: false },
				{ name: 'Yes', value: true }
			]
		},
		{
			type: 'list',
			name: 'tool',
			message: 'What would you like to do?',
			choices: [
				{ name: 'Configure system', value: 'config' },
				{ name: 'Re-initialize the database', value: 'db' },
				{ name: 'Re-initialize database with sample data', value: 'dbWithData' },
				{ name: 'Update system', value: 'update' }
			],
			when: answers => answers.sure
		}
	]);

	switch (tool) {
		case 'config':
			await configureSystem(prompt);
			break;
		case 'db':
			await rebuildDatabase(prompt);
			break;
		case 'dbWithData':
			await rebuildDatabase(prompt, { prePopulateInitial: true });
			break;
		case 'update':
			await updateSystem(prompt);
			break;
	}

})()
	.then(() => {
		console.log('');
		process.exit(0);
	})
	.catch(err => {
		console.log(chalk.red(err.fullStack || err.stack));
	});