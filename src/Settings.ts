/** All the settings this plugin needs to work. */
export interface Settings {
	apiKey: string;
	defaultTags: string[];
	trackerLinks: TrackerLink[];
}

export interface TrackerLink {
	regexp: string;
	replacement: string;
}

export const DEFAULT_SETTINGS: Settings = {
	apiKey: '',
	defaultTags: [],
	trackerLinks: [],
}
