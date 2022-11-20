import * as path from 'path';

const env = process.env.NODE_ENV || 'development';
const p = path.join(process.cwd(), `env/${env}.env`);
const dotEnvOptions = {
	path: p,
};

export { dotEnvOptions };
