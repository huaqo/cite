import { renderResults, Notice } from "obsidian";

export function renderZoteroItem(
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

export function renderZoteroAnnotation(
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
