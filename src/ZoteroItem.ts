import type { ZoteroResponse } from "./ZoteroResponse";

export class ZoteroItem {
	constructor(
		public key: string,
		public citation: string,
		public bibliography: string,
		public itemType: string,
		public title: string,
		public abstractNote: string,
		public date: string,
		public shortTitle: string,
		public language: string,
		public libraryCatalog: string,
		public publisher: string,
		public place: string,
		public ISBN: string,
		public numPages: string,
		public creators: string,
		public tags: string,
		public collections: string,
		public relations: string,
		public dateAdded: string,
		public dateModified: string,
		public attachmentItemKey: string,
		public parentItemKey: string,
		public parentItem?: ZoteroItem,
		public annotationText: string,
		public annotationComment: string,
		public annotationColor: string,
		public pageLabel: string,
	) {}

	static fromResponse(item: ZoteroResponse): ZoteroItem {
		const data = item.data;

		return new ZoteroItem(
			item.key ?? "",
			this.html2text(item.citation ?? ""),
			this.html2text(item.bib ?? ""),
			data?.itemType ?? "",
			data?.title ?? "",
			data?.abstractNote ?? "",
			data?.date ?? "",
			data?.shortTitle ?? "",
			data?.language ?? "",
			data?.libraryCatalog ?? "",
			data?.publisher ?? "",
			data?.place ?? "",
			data?.ISBN ?? "",
			data?.numPages ?? "",
			this.formatCreators(data?.creators),
			this.formatTags(data?.tags),
			this.array2text(data?.collections),
			this.object2text(data?.relations),
			data?.dateAdded ?? "",
			data?.dateModified ?? "",
			data?.parentItem ?? "",
			"",
			undefined,
			data?.annotationText ?? "",
			data?.annotationComment ?? "",
			this.hex2color(data?.annotationColor),
			data?.pageLabel ?? "",
		);
	}

	private static array2text(values?: unknown[]): string {
		return values?.map(String).join(", ") ?? "";
	}

	private static object2text(value?: Record<string, unknown>): string {
		if (!value) return "";
		return Object.values(value).flat().map(String).join(", ");
	}

	private static formatTags(tags?: Array<{ tag?: string }>): string {
		return tags
			?.map(t => t.tag ?? "")
			.filter(Boolean)
			.join(", ") ?? "";
	}

	private static formatCreators(
		creators?: Array<{
			firstName?: string;
			lastName?: string;
			name?: string;
		}>
	): string {
		return creators
			?.map(c => c.name ?? [c.firstName, c.lastName].filter(Boolean).join(" "))
			.filter(Boolean)
			.join(", ") ?? "";
	}

	private static html2text(html: string): string {
		const div = document.createElement("div");
		div.innerHTML = html;

		return div.textContent?.trim() ?? "";
	}

	private static hex2color(hex?: string): string {
		switch (hex?.toLowerCase()) {
			case "#a28ae5": return "Purple";
			case "#ff6666": return "Red";
			case "#009980": return "Teal";
			case "#ffd400": return "Yellow";
			default: return "";
		}
	}

}

