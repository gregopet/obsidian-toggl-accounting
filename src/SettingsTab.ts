import {App, PluginSettingTab, Setting} from "obsidian";
import AccountingPlugin from "./main";
import {useTogglStore} from "./stores/Toggl";

export default class ObsidianSettingsTab extends PluginSettingTab {
	plugin: AccountingPlugin;

	constructor(app: App, plugin: AccountingPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: 'Settings Obsidian Accounting Plugin'});

		new Setting(containerEl)
			.setName('Obsidian API key')
			.setDesc('Find it at https://track.toggl.com/profile')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName("Default tags")
			.setDesc("Tags to decorate new tags with (comma separated)")
			.addText(text => text
				.setPlaceholder("Your comma-separated tags")
				.setValue(this.plugin.settings.defaultTags.join(", "))
				.onChange(async(value: string)=> {
					this.plugin.settings.defaultTags = value.split(",").map(s => s.trim())
					await this.plugin.saveSettings();
				}));
	}
}
