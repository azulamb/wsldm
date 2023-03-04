import { WSL } from './wsl.ts';

export interface DistributionInfo {
	default: boolean;
	name: string;
	state: string;
	wsl_version: number;
}

export class WSLDistributionManager {
	public wsl = new WSL();

	constructor() {}

	public load(): Promise<DistributionInfo[]> {
		return this.wsl.list({ mode: 'all', show: 'verbose' }).then((result) => {
			const lines = result.stdout.split(/[\r\n]+/);
			lines.shift();

			return lines.filter((value) => {
				return !!value;
			}).map((line) => {
				const values = line.split(/\s+/);
				return {
					default: values[0] === '*',
					name: values[1],
					state: values[2],
					wsl_version: parseInt(values[3]) || 0,
				};
			});
		});
	}

	public async replicate(distribution: string, name: string, callback: (type: 'export' | 'import') => unknown) {
		callback('export');
		const exportResult = await this.wsl.export(distribution, name);
		callback('import');
		await this.wsl.import(name, exportResult.file, exportResult.path);
	}

	public async delete(name: string) {
		return this.wsl.unregister(name);
	}
}
