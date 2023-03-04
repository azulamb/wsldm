export class WSL {
	protected wsl = 'wsl';
	protected distributionDirectory = '$env:userprofile\\WSL';

	constructor() {
	}

	public setWSL(wsl: string) {
		this.wsl = wsl;
		return this;
	}

	public setDistributionDirectory(dir: string) {
		this.distributionDirectory = dir.replace(/\\+$/, '');
		return this;
	}

	protected outputToString(output: Promise<Uint8Array>, label = 'utf-16') {
		return output.then((result: Uint8Array | Uint16Array) => {
			return new TextDecoder(label).decode(result);
		});
	}

	public list(options: { mode?: 'all' | 'running' | 'online'; show?: 'quiet' | 'verbose' } = { mode: 'all' }) {
		const cmd = [this.wsl, '--list'];
		if (options.mode) {
			cmd.push(`--${options.mode}`);
		}
		if (options.show) {
			cmd.push(`--${options.show}`);
		}
		const process = Deno.run({
			cmd: cmd,
			stdout: 'piped',
			stderr: 'piped',
		});

		return process.status().then(async (result) => {
			if (!result.success) {
				throw new Error(`Failure: "${cmd.join(' ')}"`, {
					cause: {
						status: result,
						process: process,
					},
				});
			}

			const stdout = await this.outputToString(process.output());
			const stderr = await this.outputToString(process.stderrOutput());
			return {
				status: result,
				process: process,
				stdout: stdout,
				stderr: stderr,
			};
		});
	}

	public async createDirectory() {
		const process = Deno.run({
			cmd: ['powershell', 'chcp', '65001', '>', '$null', ';', 'Write-Output', this.distributionDirectory],
			stdout: 'piped',
		});

		const path = (await process.status().then(() => {
			return this.outputToString(process.output(), 'utf-8');
		})).trim();

		return Deno.mkdir(path).catch((error) => {
			if (error && error.name === 'AlreadyExists') {
				return;
			}
			throw error;
		}).then(() => {
			return path;
		});
	}

	public async export(distribution: string, name: string) {
		const path = await this.createDirectory();
		const file = `${path}\\${name}.tar`;

		const cmd = [this.wsl, '--export', distribution, file];

		const process = Deno.run({
			cmd: cmd,
			stdout: 'piped',
			stderr: 'piped',
		});

		return process.status().then(async (result) => {
			if (!result.success) {
				throw new Error(`Failure: "${cmd.join(' ')}"`, {
					cause: {
						status: result,
						process: process,
					},
				});
			}

			const stdout = await this.outputToString(process.output());
			const stderr = await this.outputToString(process.stderrOutput());
			return {
				status: result,
				process: process,
				stdout: stdout,
				stderr: stderr,
				file: file,
				path: path,
			};
		}).catch((error) => {
			if (!(<Error> error).cause) {
				throw error;
			}
			return this.outputToString(process.output()).then((result) => {
				throw new Error((<Error> error).message + '\n' + result, { cause: error.cause });
			});
		});
	}

	public import(name: string, file: string, path: string) {
		const cmd = [this.wsl, '--import', name, `${path}\\${name}`, file];

		const process = Deno.run({
			cmd: cmd,
			stdout: 'piped',
			stderr: 'piped',
		});

		return process.status().then(async (result) => {
			if (!result.success) {
				throw new Error(`Failure: "${cmd.join(' ')}"`, {
					cause: {
						status: result,
						process: process,
					},
				});
			}

			const stdout = await this.outputToString(process.output());
			const stderr = await this.outputToString(process.stderrOutput());
			return {
				status: result,
				process: process,
				stdout: stdout,
				stderr: stderr,
			};
		}).catch((error) => {
			if (!(<Error> error).cause) {
				throw error;
			}
			return this.outputToString(process.output()).then((result) => {
				throw new Error((<Error> error).message + '\n' + result, { cause: error.cause });
			});
		});
	}

	public unregister(name: string) {
		const cmd = [this.wsl, '--unregister', name];

		const process = Deno.run({
			cmd: cmd,
			stdout: 'piped',
			stderr: 'piped',
		});

		return process.status().then(async (result) => {
			if (!result.success) {
				throw new Error(`Failure: "${cmd.join(' ')}"`, {
					cause: {
						status: result,
						process: process,
					},
				});
			}

			const stdout = await this.outputToString(process.output());
			const stderr = await this.outputToString(process.stderrOutput());
			return {
				status: result,
				process: process,
				stdout: stdout,
				stderr: stderr,
			};
		}).catch((error) => {
			if (!(<Error> error).cause) {
				throw error;
			}
			return this.outputToString(process.output()).then((result) => {
				throw new Error((<Error> error).message + '\n' + result, { cause: error.cause });
			});
		});
	}
}
