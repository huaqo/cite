import { renderResults, Notice } from "obsidian";

export function renderZoteroItem(
	match: FuzzyMatch<ZoteroItem>,
	el: HTMLElement,
	property: string
) {
	const { item } = match;

	const titleEl = el.createDiv();
	renderResults(titleEl, item.title, match.match);

	const subtitleEl = el.createEl("small");
	const offset = -(item.title.length + 1);
	renderResults(
		subtitleEl,
		`${item[property]}`,
		match.match,
		offset
	);
}

export function renderZoteroAnnotation(
	match: FuzzyMatch<ZoteroItem>,
	el: HTMLElement,
	property: string
) {
	const { item } = match;

	const titleEl = el.createDiv();
	renderResults(titleEl, item.annotationText, match.match);

	const subtitleEl = el.createEl("small");
	const offset = -(item.annotationText.length + 1);

	const annotationProperties = [
		"attachmentItemKey",
		"parentItemKey",
		"parentItem",
		"annotationText",
		"annotationComment",
		"annotationColor",
		"pageLabel",
	]

	let output = "";

	if (annotationProperties.includes(property)){
		output = `${item[property]}`;
	} else {
		output = `${item.parentItem[property]}`;
	};

	renderResults(
		subtitleEl, 
		output,
		match.match, 
		offset
	);
}

export async function loadItems(
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

export async function loadAnnotations(
	client: ZoteroClient,
): Promise<ZoteroItem[]> {

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
