import { App, FuzzyMatch, FuzzySuggestModal, renderResults, Notice } from 'obsidian';
import {CiteClient, ZoteroItemResponse} from "./clients"

export class CiteModal extends FuzzySuggestModal<ZoteroItemResponse> {

	private onChoose: (citation: string) => void;
	private client: CiteClient;
	private items: ZoteroItemResponse[] = [];
	private zoteroBaseUrl: string;
	private createLink: boolean;
	private mode: string;

	constructor(
		app: App, 
		port: string,
		createLink: boolean,
		style: string,
		mode: string,
		onChoose: (citation: string) => void,
	) {
		super(app);
		this.client = new CiteClient(port, style);
		this.onChoose = onChoose;
		this.setPlaceholder("Loading citations...");
		this.zoteroBaseUrl = "zotero://select/library/items/";
		this.createLink = createLink;
		this.mode = mode;
	}

	async onOpen(){
		super.onOpen();

		try {
			if (this.mode === "citation"){
				this.items = await this.client.getAllCitations();
			} else if (this.mode === "bibliography"){
				this.items = await this.client.getAllBibliographies();
			} else {
				throw new Error(`Unknown mode: ${this.mode}`);
			}

			this.setPlaceholder("Search Zotero...");
			this.inputEl.disabled = false;
			this.inputEl.focus();
			this.updateSuggestions();	
		} catch (error) {
			new Notice("Failed to load citations/bibliographies from Zotero. Maybe you forgot to turn on or configure Zotero.");
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

	private htmlToPlainText(html: string): string {
		const div = document.createElement("div");
		div.innerHTML = html;

		return div.textContent?.trim() ?? "";
	}

	getItems(): ZoteroItemResponse[] {
		return this.items;
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
	
		let output = "";

		if (this.mode === "citation"){
			const raw = item.citation ?? "";
			output = this.htmlToPlainText(raw);
		} else if (this.mode === "bibliography"){
			const raw = item.bib ?? "";
			output = this.htmlToPlainText(raw);
		} else {
			throw new Error(`Unknown mode: ${this.mode}`);
		}

		if (!this.createLink) {
			this.onChoose(output);
		} else {
			this.onChoose(`[${output}](${this.zoteroBaseUrl}${this.getKey(item)})`);
		}
	}

}
