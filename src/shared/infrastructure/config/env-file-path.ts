import fs from 'node:fs';
import path from 'node:path';

export function resolveEnvFilePath(nodeEnv = process.env.NODE_ENV ?? 'development'): string {
	const candidate = path.resolve(process.cwd(), 'env', `${nodeEnv}.env`);
	if (fs.existsSync(candidate)) {
		return candidate;
	}

	return path.resolve(process.cwd(), 'env', 'development.env');
}
