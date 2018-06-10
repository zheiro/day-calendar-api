/* eslint-disable no-console */
import '@babel/polyfill';
import chalk from 'chalk';
import _ from 'lodash';
import { resolve } from 'path';
import { pathExists, outputFile, readFile } from 'fs-extra';


const items = {
	DB_HOST: 'localhost',
	DB_NAME: 'day_calendar',
	DB_USERNAME: 'root',
	DB_PASSWORD: 'root',
};

const secretFields = [
	'DB_PASSWORD',
];

export default async function configureSystem(prompt) {

	let isConfirmed = false;
	let config = {};

	const filePath = resolve(__dirname, '../../.env');
	if (await pathExists(filePath)) {
		const file = (await readFile(filePath)).toString('utf8');
		file.split(/\r?\n/).forEach(line => {
			const entry = line.split('=');
			config[entry[0]] = entry[1];
		});
	}

	while (!isConfirmed) {
		config = await prompt(_.entries(items).map(entry => {
			const isSecret = secretFields.indexOf(entry[0]) > -1;

			return {
				type: isSecret ? 'password' : 'input',
				name: entry[0],
				message: entry[1],
				default: config[entry[0]]
			};
		}));

		console.log('');
		console.log(chalk.cyan('[i]'), 'Make sure to check the settings you provided.');
		console.log('');

		isConfirmed = (await prompt([
			{
				type: 'list',
				name: 'isConfirmed',
				message: 'Are the settings correct?',
				choices: [
					{ name: 'Yes', value: true },
					{ name: 'No', value: false }
				]
			}
		])).isConfirmed;

		console.log('');

		try {
			const fileData = _.entries(config).map(entry => `${entry[0]}=${entry[1]}`).join('\n');
			await outputFile(filePath, fileData);
			console.log(chalk.green('[√]'), 'Settings have been updated. Restart Dark Knight to apply them.');
		} catch (err) {
			console.log(chalk.red('[!]'), 'Unable to update settings:', err.message);
		}
	}

}