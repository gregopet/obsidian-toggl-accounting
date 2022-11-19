import {defineStore} from "pinia";
import obsidian from "obsidian";
import {ref} from "vue";

/** Store for communicating with Obsidian from Vue */
export const useObsidanStore = defineStore('obsidian', () => {
	const app = ref<obsidian.App>()
	const plugin = ref<obsidian.Plugin>()

	function registerApp(application: obsidian.App, thePlugin: obsidian.Plugin) {
		app.value = application;
		plugin.value = thePlugin;
	}

	return { app, plugin, registerApp }
});
