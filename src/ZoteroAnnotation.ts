import type { ZoteroResponse } from "./ZoteroResponse";
import { ZoteroItem } from "./ZoteroItem";

export class ZoteroAnnotation {

	constructor(
		public key: string,
		public attachmentItemKey: string,
		public parentItemKey: string,
		public parentItem?: ZoteroItem,
		public text: string = "",
		public comment: string = "",
		public color: string = "",
		public pageLabel: string = "",
	){}

	static fromResponse(item: ZoteroResponse): ZoteroAnnotation {
		return new ZoteroAnnotation(
			item.key ?? "",
			item.data?.parentItem ?? "",
			"",
			undefined,
			item.data?.annotationText ?? "",
			item.data?.annotationComment ?? "",
			item.data?.annotationColor ?? "",
			item.data?.pageLabel ?? "",
		);
	}

	toString(): string {
		return [
			this.key,
			this.text,
			this.comment,
			this.color,
			this.pageLabel,
			this.parentItem?.title,
			this.parentItem?.creators,
			this.parentItem?.year,
			this.parentItemKey,
			this.attachmentItemKey,
		]
			.filter(Boolean)
			.join(" ");
	}

}
