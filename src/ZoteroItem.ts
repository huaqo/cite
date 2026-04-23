import type { ZoteroResponse } from "./ZoteroResponse";

export class ZoteroItem {
	constructor(
		public title: string,
		public year: string,
		public creators: string,
		public key: string,
		public citation: string,
		public bibliography: string,
	) {}

	static fromResponse(item: ZoteroResponse): ZoteroItem {
		const title = item.data?.title ?? "Untitled";
		const date = item.data?.date;
		const yearMatch = date?.match(/\b\d{4}\b/);
		const year = yearMatch ? yearMatch[0] : "n.d.";
		const creators = this.formatCreators(item.data?.creators);
		const key = item.key ?? "No Key";
		const citation = this.htmlToPlainText(item.citation ?? "");
		const bibliography = this.htmlToPlainText(item.bib ?? "");
		return new ZoteroItem(title, year, creators, key, citation, bibliography);
	}

	private static formatCreators(
		creators?: Array<{
			firstName?: string;
			lastName?: string;
			name?: string;
		}>
	): string {
		if (!creators || creators.length === 0) return "Unknown author";

		const names = creators.map(c => {
			if (c.name) return c.name;
			if (c.firstName && c.lastName) return `${c.firstName} ${c.lastName}`;
			if (c.lastName) return c.lastName;
			return "Unknown";
		});

		return names.join(" & ");
	}

	private static htmlToPlainText(html: string): string {
		const div = document.createElement("div");
		div.innerHTML = html;

		return div.textContent?.trim() ?? "";
	}

	toString(): string {
		return [this.title, this.year, this.creators, this.key, this.citation, this.bibliography]
			.filter(Boolean)
			.join(" ");
	}

	toStringShort(): string {
		return [this.creators, this.year]
			.filter(Boolean)
			.join(", ");
	}

}

