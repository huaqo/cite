import { shell } from "electron";
import { App, FuzzyMatch, FuzzySuggestModal } from 'obsidian';
import { ZoteroClient } from "./ZoteroClient";
import { ZoteroItem } from "./ZoteroItem";
import { loadItems, renderZoteroItem } from "./Utils"

const ZOTERO_BASE_URL = "zotero://select/library/items/";

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

