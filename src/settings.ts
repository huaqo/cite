import {App, PluginSettingTab, Setting } from "obsidian";

export interface Settings {
	portSetting: string;
	styleSetting: string;
	linkSetting: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
	portSetting: '23119',
	styleSetting: 'apa',
	linkSetting: true
}

export class SettingTab extends PluginSettingTab {
	plugin: Cite;

	constructor(app: App, plugin: Cite) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Port')
			.setDesc('http://localhost:<PORT>/api/')
			.addText(text => text
				.setPlaceholder('Enter a Port')
				.setValue(this.plugin.settings.portSetting)
				.onChange(async (value) => {
					this.plugin.settings.portSetting = value;
					await this.plugin.saveSettings();
			}));

		new Setting(containerEl)
			.setName('Style')
			.setDesc('https://www.zotero.org/styles?q=<STYLE>')
			.addText(text => text
				.setPlaceholder('Enter a Style')
				.setValue(this.plugin.settings.styleSetting)
				.onChange(async (value) => {
					this.plugin.settings.styleSetting = value;
					await this.plugin.saveSettings();
			}));

		new Setting(containerEl)
			.setName('URI')
			.setDesc('zotero://select/library/items/...')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.linkSetting)
				.onChange(async (value) => {
					this.plugin.settings.linkSetting = value;
					await this.plugin.saveSettings();
					this.display();
				})
			);

	}

}
