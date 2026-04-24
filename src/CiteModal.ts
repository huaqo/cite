import { App, FuzzyMatch, FuzzySuggestModal } from 'obsidian';
import { ZoteroClient } from "./ZoteroClient";
import { ZoteroItem } from "./ZoteroItem";
import { loadItems, renderZoteroItem } from "./Utils"
import { Settings } from "./Settings";

const ZOTERO_BASE_URL = "zotero://select/library/items/";

export class CiteModal extends FuzzySuggestModal<ZoteroItem> {

	private onChoose: (reference: string) => void;
	private client: ZoteroClient;
	private items: ZoteroItem[] = [];
	private settings: Settings;
	private mode: string;

	constructor(
		app: App, 
		settings: Settings,
		mode: string,
		onChoose: (reference: string) => void,
	) {
		super(app);
		this.setPlaceholder("Loading...");
		this.settings = settings;
		this.client = new ZoteroClient(this.settings.port, this.settings.style);
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
		return `${item.title} ${item[this.settings.search]}`;
	}

	renderSuggestion(match: FuzzyMatch<ZoteroItem>, el: HTMLElement) {
		renderZoteroItem(match, el, this.settings.search);
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

		if (!this.settings.link) {
			this.onChoose(output);
		} else {
			this.onChoose(`[${output}](${ZOTERO_BASE_URL}${item.key})`);
		}

	}

}
