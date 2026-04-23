export type ZoteroResponse = {
	key: string;
	version: number;
	links?: Record<string, unknown>;
	meta?: Record<string, unknown>;
	citation?: string;
	bib?: string;
	data?: {
		title?: string;
		date?: string;
		itemType?: string;
		parentItem?: string;
		annotationText?: string;
		annotationComment?: string;
		annotationColor?: string;
		pageLabel?: string;
		creators?: Array<{
			firstName?: string;
			lastName?: string;
			name?: string;
		}>;
	};
};
