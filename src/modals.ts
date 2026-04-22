import { App, FuzzyMatch, FuzzySuggestModal, renderResults, Notice } from 'obsidian';
import {CiteReferenceClient, ZoteroItemResponse} from "./clients"

export class CiteReferenceModal extends FuzzySuggestModal<ZoteroItemResponse> {

	private onChoose: (citation: string) => void;
	private client: CiteReferenceClient;
	private citations: ZoteroItemResponse[] = [];
	private zoteroBaseUrl: string;
	private createLink: boolean;

	constructor(
		app: App, 
		port: string,
		createLink: boolean,
		onChoose: (citation: string) => void,
	) {
		super(app);
		this.client = new CiteReferenceClient(port);
		this.onChoose = onChoose;
		this.setPlaceholder("Loading citations...");
		this.zoteroBaseUrl = "zotero://select/library/items/";
		this.createLink = createLink;
	}

	async onOpen(){
		super.onOpen();

		try {
			const items = await this.client.getAllItems();

			this.citations = items.filter(
				(item): item is ZoteroItemResponse & { citation: string } => !!item.citation
			);

			this.setPlaceholder("Search citations...");
			this.inputEl.disabled = false;
			this.inputEl.focus();
			this.updateSuggestions();	
		} catch (error) {
			new Notice("Failed to load citations from Zotero. Maybe you forgot to turn on or configure Zotero.");
			console.error(error);
			this.close();
		}
	}

	private getTitle(item: ZoteroItemResponse): string {
		return item.data?.title ?? "Untitled";
	}

	private getYear(item: ZoteroItemResponse): string {
		const date = item.data?.date;
		if (!date) return "n.d.";

		const match = date.match(/\b\d{4}\b/);
		return match ? match[0] : "n.d.";
	}

	private getAuthor(item: ZoteroItemResponse): string {
		const creators = item.data?.creators;
		if (!creators || creators.length === 0) return "Unknown author";

		const first = creators[0];

		if (first.name) return first.name;
		if (first.firstName && first.lastName) return `${first.firstName} ${first.lastName}`;
		if (first.lastName) return first.lastName;

		return "Unknown author";
	}

	private getKey(item: ZoteroItemResponse): string {
		return item.key ?? "No Key";
	}

	getItems(): ZoteroItemResponse[] {
		return this.citations;
	}

	getItemText(item: ZoteroItemResponse): string {
		return `${this.getTitle(item)} ${this.getAuthor(item)} ${this.getYear(item)}`;
	}

	renderSuggestion(match: FuzzyMatch<ZoteroItemResponse>, el: HTMLElement) {
		const { item } = match;

		const title = this.getTitle(item);
		const author = this.getAuthor(item);
		const year = this.getYear(item);

		const titleEl = el.createDiv();
		renderResults(titleEl, title, match.match);

		const subtitleEl = el.createEl("small");
		const offset = -(title.length + 1);
		renderResults(subtitleEl, `${author}, ${year}`, match.match, offset);
	}

	onChooseItem(item: ZoteroItemResponse) {
		if (!item.citation) {
			throw new Error(`Missing citation for item ${item.key}`);
			return;
		}

		if (!this.createLink) {
			this.onChoose(item.citation);
		} else {
			this.onChoose(`[${item.citation}](${this.zoteroBaseUrl}${this.getKey(item)})`);
		}
	}

}
