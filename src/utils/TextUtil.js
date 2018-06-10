export function formatNumber(value, decimalPlaces = 0, grouping = true) {
	const formattedValue = value.toFixed(decimalPlaces);
	if (grouping) {
		return formattedValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
	} else {
		return formattedValue;
	}
}

export function fixedLengthNumber(number, length) {
	let fixedNumber = number.toString().substr(0, length);
	while (fixedNumber.length < length) {
		fixedNumber = '0' + fixedNumber;
	}
	return fixedNumber;
}

export function formatName(firstName, middleName, lastName, format = 'LLLL, FFFF MMMM') {
	return format
		.replace('LLLL', lastName)
		.replace('FFFF', firstName)
		.replace('MMMM', middleName)
		.replace('L', lastName.charAt(0).toUpperCase())
		.replace('F', firstName.charAt(0).toUpperCase())
		.replace('M', middleName.charAt(0).toUpperCase());
}