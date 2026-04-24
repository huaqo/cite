import { App, Editor, MarkdownView, Modal, Plugin, Notice } from 'obsidian';
import { DEFAULT_SETTINGS, Settings, SettingTab } from "./settings";
import { CiteModal } from "./CiteModal";
import { OpenModal } from "./OpenModal";
import { AnnotationModal } from "./AnnotationModal";

export default class Cite extends Plugin {
	settings: Settings;

	async onload() {

		await this.loadSettings();

		this.addSettingTab(new SettingTab(this.app, this));

		this.addCommand({
			id: 'open-command',
			name: 'open',
			callback: () => {
				new OpenModal(this.app, this.settings.portSetting).open();
			},
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
				new CiteModal(this.app, this.settings.portSetting, this.settings.linkSetting, this.settings.styleSetting, "bibliography", (bibliography: string) => {
					editor.replaceSelection(bibliography);
				}).open();
			}
		});

		this.addCommand({
			id: 'annotation-command',
			name: 'insert annotations',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				new AnnotationModal(this.app, this.settings.portSetting, this.settings.linkSetting, this.settings.styleSetting, (annotations: string) => {
					editor.replaceSelection(annotations);
				}).open();
			}
		});

		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<Settings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

