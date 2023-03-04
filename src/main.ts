import { DistributionInfo, WSLDistributionManager } from './wsldm.ts';

class Main {
	protected wsldm = new WSLDistributionManager();
	protected distributions: DistributionInfo[] = [];

	constructor() {}

	public async start() {
		while (true) {
			await this.list();
			const result = this.nextCommand();
			if (result === 'exit') {
				break;
			}
			await this.execCommand(result);
		}
		console.log('exit.');
	}

	protected nextCommand() {
		const next = prompt('What next? [list(l)/replicate(r)/delete(d)/exit]', 'exit');
		switch (next) {
			case 'list':
			case 'l':
				return 'list';
			case 'replicate':
			case 'r':
				return 'replicate';
			case 'delete':
			case 'd':
				return 'delete';
		}
		return 'exit';
	}

	protected execCommand(command: 'list' | 'replicate' | 'delete') {
		switch (command) {
			case 'list':
				return Promise.resolve();
			case 'replicate':
				return this.replicate();
			case 'delete':
				return this.delete();
		}
	}

	protected async list() {
		this.distributions = await this.wsldm.load();
		const drawLine = (() => {
			const digits = Math.max(2, String(this.distributions.length).length);

			return (no: string | number, name: string, isDefault: boolean) => {
				if (typeof no === 'string') {
					no = no.padEnd(digits, ' ');
				} else {
					no = String(no).padStart(digits, ' ');
				}
				const $default = isDefault ? ' *' : '';
				console.log(`${no} ${name}${$default}`);
			};
		})();

		drawLine('No', 'Name', false);
		this.distributions.forEach((distro, index) => {
			drawLine(index + 1, distro.name, distro.default);
		});
	}

	protected async replicate() {
		const target = prompt('Target no or name:') || '';
		const distribution = this.searchDistro(target.trim());
		if (!distribution) {
			throw new Error(`Notfound target: ${target}`);
		}

		const newName = prompt('New distribution name:') || '';
		if (!newName) {
			throw new Error(`No distribution name: ${newName}`);
		}
		const duplication = this.searchDistro(newName.trim());
		if (duplication) {
			throw new Error(`Exists distribution name: ${newName}`);
		}

		const result = confirm(`replicate: ${distribution.name} => ${newName}`);
		if (!result) {
			throw new Error('Stopped replicating.');
		}

		//console.log(`wsl.exe --export ${distribution.name} $env:userprofile\\WSL\\${newName}.tar`);
		//console.log(`wsl.exe --import ${newName} $env:userprofile\\WSL\\${newName} $env:userprofile\\WSL\\${newName}.tar`);

		await this.wsldm.replicate(distribution.name, newName, (type) => {
			if (type === 'export') {
				console.log(`Export ${distribution.name} ...`);
			}else{
				console.log(`Import ${newName} ...`);
			}
		});
		console.log(`Start: wsl --distribution ${newName}`);
	}

	protected async delete() {
		const target = prompt('Target no or name:') || '';
		const distribution = this.searchDistro(target.trim());
		if (!distribution) {
			throw new Error(`Notfound target: ${target}`);
		}

		const result = confirm(`Delete: ${distribution.name}`);
		if (!result) {
			throw new Error('Stopped deleting.');
		}

		await this.wsldm.delete(distribution.name);
		console.log('Deleted!');
	}

	protected searchDistro(name: string) {
		for (const info of this.distributions) {
			if (info.name === name) {
				return info;
			}
		}
		const index = (parseInt(name) || 0) - 1;
		if (index < 0 || this.distributions.length <= index) {
			return null;
		}
		return this.distributions[index];
	}
}

const main = new Main();

main.start().catch((error) => {
	console.error(error);
});
