import { randomBytes, createHmac } from 'crypto';
import secureRandom from 'secure-random';


export function hashPassword(password, salt) {
	if (!salt) {
		salt = secureRandom(32, { type: 'Buffer' }).toString('base64');
	}

	const hash = createHmac('sha512', salt);
	hash.update(password);

	return {
		hash: hash.digest('base64'),
		salt
	};
}

export function isPasswordValid(password, user) {
	if (user.password && user.salt) {
		const pwHash = exports.hashPassword(password, user.salt);
		return pwHash.hash === user.password;
	} else {
		throw new TypeError('Password and salt are required');
	}
}

export function generateInviteCode() {
	return randomBytes(16).toString('base64');
}

export function generateRecordId() {
	const digitChars = '0123456789';
	let recordId = '';

	while (recordId.length < 7) {
		let digit = digitChars[Math.floor(digitChars.length * Math.random())];
		recordId += digit;
	}

	return recordId;
}

export function generateTrackingNumber() {
	const digitChars = '0123456789abcdefghijklmnopqrstuvwxyz';
	let trackingNumber = '';

	while (trackingNumber.length < 6) {
		let digit = digitChars[Math.floor(digitChars.length * Math.random())];
		trackingNumber += digit;
	}

	return trackingNumber;
}

export function transformSignature({ v, r, s }) {
	return '0x'
		+ r.toString('hex')
		+ s.toString('hex')
		+ v.toString('hex');
}