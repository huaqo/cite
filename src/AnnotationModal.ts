import { App, FuzzyMatch, FuzzySuggestModal } from 'obsidian';
import { ZoteroClient } from "./ZoteroClient";
import { ZoteroAnnotation } from "./ZoteroAnnotation";
import { loadAnnotations, renderZoteroAnnotation } from "./Utils"

const ZOTERO_BASE_URL = "zotero://select/library/items/";

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

