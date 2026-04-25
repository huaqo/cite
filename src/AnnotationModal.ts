import { App, FuzzyMatch, FuzzySuggestModal } from 'obsidian';
import { ZoteroClient } from "./ZoteroClient";
import { loadAnnotations, renderZoteroAnnotation } from "./Utils"
import { Settings } from "./Settings";

const ZOTERO_BASE_URL = "zotero://open-pdf/library/items/";

export class AnnotationModal extends FuzzySuggestModal<ZoteroItem> {
	private client: ZoteroClient;
	private annotations: ZoteroItem[] = [];
	private onChoose: (item: string) => void;
	private settings: Settings;

	constructor(
		app: App,
		settings: Settings,
		onChoose: (item: string) => void,
	) {
		super(app);
		this.settings = settings;
		this.client = new ZoteroClient(this.settings.port, this.settings.style);
		this.setPlaceholder("Loading...");
		this.onChoose = onChoose;
	}

	async onOpen(){
		this.annotations = await loadAnnotations(this.client);
		super.onOpen();
	}

	getItems(): ZoteroItem[] {
		return this.annotations;
	}

	getItemText(item: ZoteroItem): string {
		return `${item.annotationText} ${item.parentItem[this.settings.search]}`;
	}

	renderSuggestion(match: FuzzyMatch<ZoteroItem>, el: HTMLElement) {
		renderZoteroAnnotation(match, el, this.settings.search);
	}

	async onChooseItem(item: ZoteroItem) {

		let citation = item.parentItem.citation ?? "";

		if (this.settings.link) {
			citation = `[${citation}](${ZOTERO_BASE_URL}${item.attachmentItemKey}?annotation=${item.key})`;
		}

		this.onChoose(`"${item.annotationText}" ${citation}`);
	}

}

