import { shell } from "electron";
import { App, FuzzyMatch, FuzzySuggestModal, renderResults, Notice } from 'obsidian';
import { ZoteroClient } from "./clients";
import { ZoteroItem } from "./ZoteroItem";
import { ZoteroAnnotation } from "./ZoteroAnnotation";

const ZOTERO_BASE_URL = "zotero://select/library/items/";

function renderZoteroItem(
	match: FuzzyMatch<ZoteroItem>,
	el: HTMLElement
) {
	const { item } = match;

	const titleEl = el.createDiv();
	renderResults(titleEl, item.title, match.match);

	const subtitleEl = el.createEl("small");
	const offset = -(item.title.length + 1);
	renderResults(
		subtitleEl,
		`${item.creators}, ${item.year}`,
		match.match,
		offset
	);
}

function renderZoteroAnnotation(
	match: FuzzyMatch<ZoteroAnnotation>,
	el: HTMLElement
) {
	const { item: annotation } = match;

	const titleEl = el.createDiv();
	renderResults(titleEl, annotation.text, match.match);

	const subtitleEl = el.createEl("small");
	const offset = -(annotation.text.length + 1);
	renderResults(subtitleEl, annotation.parentItem.toStringShort(), match.match, offset);
}

async function loadItems(
	modal: FuzzySuggestModal<ZoteroItem>,
	client: ZoteroClient,
): Promise<ZoteroItem[]> {
	try {
		const items = await client.getItemsTop();
		modal.setPlaceholder("Search Zotero...");
		modal.inputEl.disabled = false;
		modal.inputEl.focus();
		modal.updateSuggestions();
		return items;
	} catch (error) {
		new Notice(
			"Failed to load citations/bibliographies from Zotero."
		);
		console.error(error);
		modal.close();
		return [];
	}
}

async function loadAnnotations(
	client: ZoteroClient,
): Promise<ZoteroAnnotation[]> {

	try {
		const annotations = await client.getAnnotations();
		return annotations;
	} catch (error) {
		new Notice(
			"Failed to load annotations from Zotero."
		);
		console.error(error);
		return [];
	}
}

export class AnnotationModal extends FuzzySuggestModal<ZoteroAnnotation> {
	private client: ZoteroClient;
	private annotations: ZoteroAnnotation[] = [];
	private createLink: boolean;
	private onChoose: (annotations: string) => void;

	constructor(
		app: App,
		port: string,
		createLink: boolean,
		style: string,
		onChoose: (annotations: string) => void,
	) {
		super(app);
		this.client = new ZoteroClient(port, style);
		this.setPlaceholder("Loading...");
		this.createLink = createLink
		this.onChoose = onChoose;
	}

	async onOpen(){
		this.annotations = await loadAnnotations(this.client);
		super.onOpen();
	}

	getItems(): ZoteroAnnotation[] {
		return this.annotations;
	}

	getItemText(annotation: ZoteroAnnotation): string {
		return annotation.toString();
	}

	renderSuggestion(match: FuzzyMatch<ZoteroAnnotation>, el: HTMLElement) {
		renderZoteroAnnotation(match, el);
	}

	async onChooseItem(annotation: ZoteroAnnotation) {

		let citation = annotation.parentItem.citation;

		if (this.createLink) {
			citation = `[${citation}](${ZOTERO_BASE_URL}${annotation.parentItemKey})`;
		}

		this.onChoose(`"${annotation.text}" ${citation}`);
	}

}

export class OpenModal extends FuzzySuggestModal<ZoteroItem> {
	private client: ZoteroClient;
	private items: ZoteroItem[] = [];

	constructor(
		app: App,
		port: string,
	) {
		super(app);
		this.client = new ZoteroClient(port);
		this.setPlaceholder("Loading...");
	}

	async onOpen(){
		this.items = await loadItems(this, this.client);
		super.onOpen();
	}

	getItems(): ZoteroItem[] {
		return this.items;
	}

	getItemText(item: ZoteroItem): string {
		return item.toString();
	}

	renderSuggestion(match: FuzzyMatch<ZoteroItem>, el: HTMLElement) {
		renderZoteroItem(match, el);
	}

	onChooseItem(item: ZoteroItem) {
		if (!item.key) return;
		const uri = `${ZOTERO_BASE_URL}${item.key}`;
		shell.openExternal(uri);
	}

}

export class CiteModal extends FuzzySuggestModal<ZoteroItem> {

	private onChoose: (reference: string) => void;
	private client: ZoteroClient;
	private items: ZoteroItem[] = [];
	private createLink: boolean;
	private mode: string;

	constructor(
		app: App, 
		port: string,
		createLink: boolean,
		style: string,
		mode: string,
		onChoose: (reference: string) => void,
	) {
		super(app);
		this.setPlaceholder("Loading...");
		this.client = new ZoteroClient(port, style);
		this.createLink = createLink;
		this.mode = mode;
		this.onChoose = onChoose;
	}

	async onOpen(){
		this.items = await loadItems(this, this.client);
		super.onOpen();
	}

	getItems(): ZoteroItem[] {
		return this.items;
	}

	getItemText(item: ZoteroItem): string {
		return item.toString();
	}

	renderSuggestion(match: FuzzyMatch<ZoteroItem>, el: HTMLElement) {
		renderZoteroItem(match, el);
	}

	onChooseItem(item: ZoteroItem) {
	
		let output = "";

		if (this.mode === "citation"){
			output = item.citation;
		} else if (this.mode === "bibliography"){
			output = item.bibliography;
		} else {
			throw new Error(`Unknown mode: ${this.mode}`);
		}

		if (!this.createLink) {
			this.onChoose(output);
		} else {
			this.onChoose(`[${output}](${ZOTERO_BASE_URL}${item.key})`);
		}

	}

}
