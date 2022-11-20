export const randomBoolean = () => {
	const options = [true, false];
	return options[Math.floor(Math.random() * options.length)];
};
