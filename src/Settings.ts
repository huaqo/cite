export interface Settings {
	port: string;
	style: string;
	link: boolean;
	search: string;
}

export const DEFAULT_SETTINGS: Settings = {
	port: '23119',
	style: 'apa',
	link: true,
	search: "creators",
}

