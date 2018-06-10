/* eslint-disable no-console */
import '@babel/polyfill';
import { execSync } from 'child_process';
import { resolve } from 'path';
import chalk from 'chalk';


function exec(command) {
	return execSync(command, { cwd: resolve(__dirname, '../..') }).toString('utf8');
}

export default async function updateSystem() {

	const oldVersion = exec('git log -n 1 --pretty=format:"%h (%ci)"');

	console.log('');
	console.log('Will update from', chalk.cyan(oldVersion));
	console.log('');

	console.log(chalk.cyan('[1/5]'), 'Resetting changes...');
	exec('git reset --hard');

	console.log(chalk.cyan('[2/5]'), 'Pulling latest code...');
	exec('git pull');

	console.log(chalk.cyan('[3/5]'), 'Installing Node dependencies...');
	exec('npm install');

	console.log(chalk.cyan('[4/5]'), 'Running deploy script...');
	exec('npm run deploy');

	console.log(chalk.cyan('[5/5]'), 'Cleaning up...');
	exec('npm prune --production');

	console.log(exec('pm2 status'));

	const newVersion = exec('git log -n 1 --pretty=format:"%h (%ci)"');

	console.log('');
	console.log(chalk.bgGreen.whiteBright('System updated successfully.'));
	console.log('Previous version:\n', chalk.cyan(oldVersion), '\n');
	console.log('Current version:\n', chalk.cyan(newVersion));
	console.log('');

}