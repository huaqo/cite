import { Notice, requestUrl } from 'obsidian';

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

export class ZoteroClient {

	private userID: number;
	private baseURL: string;
	private style?: string;
	private baseParams: URLSearchParams;

	constructor(port: string);
	constructor(port: string, style: string);
	constructor(port: string, style?: string) {
		this.userID = 0;
		this.baseURL = `http://127.0.0.1:${port}/api/users/${this.userID}`;
		this.style = style;
		this.baseParams = new URLSearchParams();
		if (this.style) {
			this.baseParams.set("style", this.style);
		}
		this.baseParams.set("format", "json");
		this.baseParams.set("include", "citation,bib,data");
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

	async getItems(): Promise<ZoteroItemResponse[]> {
		const url = `${this.baseURL}/items?${this.baseParams.toString()}`;
		return this.request<ZoteroItemResponse[]>(url);
	}

	async getItemsTop(): Promise<ZoteroItemResponse[]> {
		const url = `${this.baseURL}/items/top?${this.baseParams.toString()}`;
		return this.request<ZoteroItemResponse[]>(url);
	}

}
