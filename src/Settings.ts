/** All the settings this plugin needs to work. */
export interface Settings {
	apiKey: string;
	defaultTags: string[];
}

export const DEFAULT_SETTINGS: Settings = {
	apiKey: '',
	defaultTags: [],
}
