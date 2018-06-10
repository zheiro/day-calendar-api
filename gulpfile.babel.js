import gulp from 'gulp';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import nodemon from 'gulp-nodemon';
import sequence from 'gulp-sequence';
import eslint from 'gulp-eslint';
import del from 'del';
import sloc from 'gulp-sloc';
import { createWriteStream } from 'fs';
import pkg from './package.json';


gulp.task('dev', ['compile-dev'], () => {
	gulp.watch('src/**/*.js', ['compile-dev']);
	nodemon({
		script: './app/index.js',
		execMap: {
			js: 'node -r dotenv/config'
		},
		watch: [
			'app',
			'api/spec.yaml',
		],
		ext: 'js yaml'
	});
});

gulp.task('pre-deploy', sequence('compile-prod', 'cleanup-before-deploy'));

gulp.task('cleanup', () => {
	return del([
		'app',
	]);
});

gulp.task('cleanup-before-deploy', () => {
	return del([
		'scripts',
		'src',
		'temp',
	]);
});

gulp.task('sloc', function () {
	gulp.src(['src/**/*.js'])
		.pipe(sloc());
});

gulp.task('lint', () => {
	return gulp.src('src/**/*.js')
		.pipe(eslint())
		.pipe(eslint.format('html', createWriteStream('eslint-report.html')))
		.pipe(eslint.failOnError());
});

gulp.task('compile-dev', () => {
	return gulp.src('src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel(pkg.babel))
		.pipe(sourcemaps.write('.', {
			sourceRoot: '/src',
		}))
		.pipe(gulp.dest('app'));
});

gulp.task('compile-prod', ['cleanup', 'lint'], () => {
	return gulp.src('src/**/*.js')
		.pipe(babel(pkg.babel))
		.pipe(gulp.dest('app'));
});
