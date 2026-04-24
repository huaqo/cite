import {App, PluginSettingTab, Setting } from "obsidian";
import { ZoteroFields } from "./ZoteroFields";

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
				.setValue(this.plugin.settings.port)
				.onChange(async (value) => {
					this.plugin.settings.port = value;
					await this.plugin.saveSettings();
			}));

		new Setting(containerEl)
			.setName('Style')
			.setDesc('https://www.zotero.org/styles?q=<STYLE>')
			.addText(text => text
				.setPlaceholder('Enter a Style')
				.setValue(this.plugin.settings.style)
				.onChange(async (value) => {
					this.plugin.settings.style = value;
					await this.plugin.saveSettings();
			}));

		new Setting(containerEl)
			.setName('URI')
			.setDesc('zotero://select/library/items/...')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.link)
				.onChange(async (value) => {
					this.plugin.settings.link = value;
					await this.plugin.saveSettings();
					this.display();
			}));

		new Setting(containerEl)
			.setName('Search')
			.setDesc('secondary search field')
			.addDropdown(dropdown => {
				ZoteroFields.forEach (opt => {
					dropdown.addOption(opt, opt);
				});

				dropdown
					.setValue(this.plugin.settings.search)
					.onChange(async (value) => {
						this.plugin.settings.search = value;
						await this.plugin.saveSettings();
					});
			});
	}

}
