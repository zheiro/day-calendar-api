/* eslint-disable no-console */
import '@babel/polyfill';
import chalk from 'chalk';
import _ from 'lodash';
import { resolve } from 'path';
import { pathExists, outputFile, readFile } from 'fs-extra';


const items = {
	// APP_BASE_URI: 'Web app public URL',
	// UPLOAD_FILE_DIR: 'Where to store uploaded files',
	DB_HOST: 'localhost',
	DB_NAME: 'day_calendar',
	DB_USERNAME: 'root',
	DB_PASSWORD: 'root',
	// APIC_BASE_URL: 'APIC endpoint base URL',
	// APIC_CLIENT_ID: 'APIC Client ID',
	// APIC_CLIENT_SECRET: 'APIC Client Secret',
	// APIC_CALLBACK_URL: 'Callback URL for APIC',
	// SMTP_HOST: 'Outgoing mail server hostname/IP address',
	// SMTP_PORT: 'Outgoing mail server port',
	// SMTP_USERNAME: 'Outgoing mail server username',
	// SMTP_PASSWORD: 'Outgoing mail server password',
	// KV_AZURE_SUBSCRIPTION_ID: 'Azure subscription ID',
	// KV_CLIENT_ID: 'KeyVault client ID',
	// KV_OBJECT_ID: 'KeyVault object ID',
	// KV_APPLICATION_SECRET: 'KeyVault application secret',
	// KV_DOMAIN: 'KeyVault domain',
	// KV_OBJECT_ID_KEYVAULT_OPERATIONS: 'KeyVault operations object ID',
	// KV_SP_KEYVAULT_OPERATIONS: 'KeyVault operations SP',
	// KV_VAULT_NAME: 'KeyVault vault name',
	// KV_KEY_NAME: 'KeyVault encryption key name',
	// KV_KEY_ID: 'KeyVault encryption key ID',
	// KV_KEY_TYPE: 'KeyVault encryption key type (usually RSA-OAEP)'
};

const secretFields = [
	'DB_PASSWORD',
	// 'APIC_CLIENT_SECRET',
	// 'SMTP_PASSWORD',
	// 'KV_APPLICATION_SECRET'
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