import {defineStore} from "pinia";
import obsidian from "obsidian";
import {ref} from "vue";
import {Settings} from "../Settings";

/** Store for communicating with Obsidian from Vue */
export const useObsidanStore = defineStore('obsidian', () => {
	const app = ref<obsidian.App>()
	const plugin = ref<obsidian.Plugin>()
	const settings = ref<Settings>()

	function registerApp(application: obsidian.App, thePlugin: obsidian.Plugin, theSettings: Settings) {
		app.value = application;
		plugin.value = thePlugin;
		settings.value = theSettings;
	}

	return { app, plugin, settings, registerApp }
});
