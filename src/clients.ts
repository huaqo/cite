import { Notice, requestUrl } from 'obsidian';
import { ZoteroItem } from './ZoteroItem';
import { ZoteroAnnotation } from './ZoteroAnnotation';
import type { ZoteroResponse } from './ZoteroResponse';

export class ZoteroClient {

	private userID: number;
	private baseURL: string;
	private style?: string;
	private params: URLSearchParams;

	constructor(port: string);
	constructor(port: string, style: string);
	constructor(port: string, style?: string) {
		this.userID = 0;
		this.baseURL = `http://127.0.0.1:${port}/api/users/${this.userID}`;
		this.style = style;
		this.params = new URLSearchParams();
		this.params.set("format", "json");
	}

	private async request<T>(url: string): Promise<T> {
		console.log(url);
		const response = await requestUrl({
			url,
			method: "GET",
			throw: false,
			headers: {
				"Zotero-API-Version": "3",
				"Accept": "application/json",
				"User-Agent": "curl/8.0.0",
			},
		});

		if (response.status !== 200) {
			new Notice(`Zotero error ${response.status}: ${response.text}`);
			throw new Error(`Zotero request failed: ${response.status} ${response.text}`);
		}

		if (response.json == null) {
			new Notice(`Invalid JSON response from Zotero: ${response.text}`);
			throw new Error(`Invalid JSON response from Zotero: ${response.text}`);
		}

		return response.json as T;

	}

	async getItems(): Promise<ZoteroItem[]> {
		if (this.style) {
			this.params.set("style", this.style);
		}
		this.params.set("include", "citation,bib,data");
		const url = `${this.baseURL}/items?${this.params.toString()}`;
		const items = await this.request<ZoteroResponse[]>(url);
		return items.map(item => ZoteroItem.fromResponse(item));
	}

	async getItemsTop(): Promise<ZoteroItem[]> {
		if (this.style) {
			this.params.set("style", this.style);
		}
		this.params.set("include", "citation,bib,data");
		const url = `${this.baseURL}/items/top?${this.params.toString()}`;
		const items = await this.request<ZoteroResponse[]>(url);
		return items.map(item => ZoteroItem.fromResponse(item));
	}

	private async getItemByKey(itemKey: string, include: string = "data"): Promise<ZoteroResponse> {
		const params = new URLSearchParams();
		params.set("format", "json");
		params.set("include", include);

		if (this.style && include.includes("citation")) {
			params.set("style", this.style);
		}

		const url = `${this.baseURL}/items/${itemKey}?${params.toString()}`;
		return await this.request<ZoteroResponse>(url);
	}

	private async resolveParentItem(annotation: ZoteroAnnotation): Promise<void> {
		if (!annotation.attachmentItemKey) return;

		const attachmentOrParent = await this.getItemByKey(annotation.attachmentItemKey, "citation,bib,data");

		const parentItemKey = attachmentOrParent.data?.parentItem;

		if (!parentItemKey) {
			annotation.parentItemKey = attachmentOrParent.key;
			const fullItem = await this.getItemByKey(attachmentOrParent.key, "citation,bib,data");
			annotation.parentItem = ZoteroItem.fromResponse(fullItem);
			return;
		}

		annotation.parentItemKey = parentItemKey;
		const fullParentItem = await this.getItemByKey(parentItemKey, "citation,bib,data");
		annotation.parentItem = ZoteroItem.fromResponse(fullParentItem);
	}

	async getAnnotations(): Promise<ZoteroAnnotation[]> {
		this.params.set("include", "data");
		this.params.set("itemType", "annotation");

		const url = `${this.baseURL}/items?${this.params.toString()}`;
		const responses = await this.request<ZoteroResponse[]>(url);

		this.params.delete("itemType");

		const annotations = responses
			.map(annotation => ZoteroAnnotation.fromResponse(annotation))
			.filter(a => a.text && a.text.trim() !== "");

		for (const annotation of annotations) {
			try {
				await this.resolveParentItem(annotation);
			} catch (error) {
				console.error(`Failed to resolve parent item for annotation ${annotation.key}`, error);
			}
		}

		return annotations;
	}

 }
