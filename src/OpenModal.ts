import { shell } from "electron";
import { App, FuzzyMatch, FuzzySuggestModal } from 'obsidian';
import { ZoteroClient } from "./ZoteroClient";
import { ZoteroItem } from "./ZoteroItem";
import { loadItems, renderZoteroItem } from "./Utils"
import { Settings } from "./Settings";

const ZOTERO_BASE_URL = "zotero://select/library/items/";

export class OpenModal extends FuzzySuggestModal<ZoteroItem> {
	private client: ZoteroClient;
	private items: ZoteroItem[] = [];
	private settings: Settings

	constructor(
		app: App,
		settings: Settings,
	) {
		super(app);
		this.settings = settings;
		this.client = new ZoteroClient(this.settings.port);
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
		return `${item.title} ${item[this.settings.search]}`;
	}

	renderSuggestion(match: FuzzyMatch<ZoteroItem>, el: HTMLElement) {
		renderZoteroItem(match, el, this.settings.search);
	}

	onChooseItem(item: ZoteroItem) {
		if (!item.key) return;
		const uri = `${ZOTERO_BASE_URL}${item.key}`;
		shell.openExternal(uri);
	}

}

