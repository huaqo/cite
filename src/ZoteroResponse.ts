export type ZoteroResponse = {
	key: string;
	version: number;
	links?: Record<string, unknown>;
	meta?: Record<string, unknown>;
	citation?: string;
	bib?: string;
	data?: {
		itemType?: string;
		title?: string;
		abstractNote?: string;
		date?: string;
		shortTitle?: string;
		language?: string;
		libraryCatalog?: string;
		publisher?: string;
		place?: string;
		ISBN?: string;
		numPages?: string;
		creators?: Array<{
			firstName?: string;
			lastName?: string;
			name?: string;
		}>;
		tags?: Array<{
			tag?: string;
		}>;
		collections?: Array<string>;
		relations?: Array<any>;
		dateAdded?: string;
		dateModified?: string;
		parentItem?: string;
		annotationText?: string;
		annotationComment?: string;
		annotationColor?: string;
		pageLabel?: string;
	};
};
