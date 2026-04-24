import { App, FuzzyMatch, FuzzySuggestModal } from 'obsidian';
import { ZoteroClient } from "./ZoteroClient";
import { ZoteroItem } from "./ZoteroItem";
import { loadItems, renderZoteroItem } from "./Utils"

const ZOTERO_BASE_URL = "zotero://select/library/items/";

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
