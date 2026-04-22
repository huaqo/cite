import { Notice, requestUrl } from 'obsidian';
import Cite from "./main";

type ZoteroItemResponse = {
	key: string;
	version: number;
	links?: Record<string, unknown>;
	meta?: Record<string, unknown>;
	citation?: string;
	bib?: string;
	data?: {
		title?: string;
		date?: string;
		creators?: Array<{
			firstName?: string;
			lastName?: string;
			name?: string;
		}>;
	};
};

export class CiteReferenceClient {

	private baseURL: string;
	private userID: number;

	constructor(port: string){
		this.baseURL = `http://127.0.0.1:${port}/api`;
		this.userID = 0;
	}

	private async request<T>(url: string): Promise<T> {
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

	async getItemReference(itemKey: string): Promise<string> {

		const url = `${this.baseURL}/users/${this.userID}/items/${itemKey}?format=json&include=citation`

		const item = await this.request<ZoteroItemResponse>(url);

		if (!item.citation) {
			throw new Error(`No citation returned for item ${itemKey}`);
		}

		return item.citation;
	}

	async getAllItems(): Promise<ZoteroItemResponse[]> {
		const url = `${this.baseURL}/users/${this.userID}/items?format=json&include=citation,data&style=apa`
		return this.request<ZoteroItemResponse[]>(url);
	}

}
