import { App, Editor, MarkdownView, Modal, Plugin, Notice } from 'obsidian';
import { DEFAULT_SETTINGS, CiteSettings, CiteSettingTab } from "./settings";
import { CiteModal } from "./modals"

export default class Cite extends Plugin {
	settings: CiteSettings;

	async onload() {

		await this.loadSettings();

		this.addRibbonIcon('scroll-text', 'insert citation', (evt: MouseEvent) => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);

			if (!view) {
				new Notice("No active Markdown view");
				console.log("No active Markdown view");
				return;
			}

			const editor = view.editor;

			new CiteModal(this.app, this.settings.portSetting, this.settings.linkSetting, this.settings.styleSetting, "citation", (citation: string) => {
				editor.replaceSelection(citation);
			}).open();
		});

		this.addCommand({
			id: 'citation-command',
			name: 'insert citation',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				new CiteModal(this.app, this.settings.portSetting, this.settings.linkSetting, this.settings.styleSetting, "citation",(citation: string) => {
					editor.replaceSelection(citation);
				}).open();
			}
		});

		this.addCommand({
			id: 'bibliograpy-command',
			name: 'insert bibliography',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				new CiteModal(this.app, this.settings.portSetting, this.settings.linkSetting, this.settings.styleSetting, "bibliography",(bibliography: string) => {
					editor.replaceSelection(bibliography);
				}).open();
			}
		});

		this.addSettingTab(new CiteSettingTab(this.app, this));

		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<CiteSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

