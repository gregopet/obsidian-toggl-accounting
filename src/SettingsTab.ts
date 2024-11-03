import {App, PluginSettingTab, Setting} from "obsidian";
import AccountingPlugin from "./main";
import {useTogglStore} from "./stores/Toggl";
import {TrackerLink} from "./Settings";

export default class ObsidianSettingsTab extends PluginSettingTab {
	plugin: AccountingPlugin;

	constructor(app: App, plugin: AccountingPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		let plugin = this.plugin;

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

		const trackers = new Setting(containerEl)
			.setName("Issue trackers")
			.setDesc("Change issue tags into links");

		this.createIssueTrackersLinksContent(trackers, plugin);
	}

	/** Changes issue tags into links to issue trackers */
	private createIssueTrackersLinksContent(trackers: Setting, plugin: AccountingPlugin) {
		const trackerLinks = document.createElement("div")
		trackers.settingEl.appendChild(trackerLinks);

		if (!this.plugin.settings.trackerLinks) this.plugin.settings.trackerLinks = [];
		const configuredLinks = this.plugin.settings.trackerLinks;

		function defaultTracker(): TrackerLink {
			return {regexp: '[A-Z0-9]{2,}-[0-9]+', replacement: 'https://mytracker.com/issue/$&'}
		}

		function addTracker(count: number) {
			const holder = document.createElement('div');
			trackerLinks.appendChild(holder);
			new Setting(holder)
				// Regexp
				.addText(txt =>
					txt.setValue(configuredLinks[count]?.regexp).setPlaceholder("[A-Z0-9]{2,}-[0-9]+").onChange(async (value) => {

						let regexpError = false;
						try {
							new RegExp(value);
						} catch (err) {
							regexpError = true;
						}
						txt.inputEl.className = regexpError ? "message mod-error" : "";

						if (!configuredLinks[count]) configuredLinks[count] = defaultTracker();
						configuredLinks[count].regexp = value;
						await plugin.saveSettings();
					})
				)
				// Replacement
				.addText(txt =>
					txt.setValue(configuredLinks[count]?.replacement).setPlaceholder("https://mytracker.com/issue/$&").onChange(async (value) => {
						if (!configuredLinks[count]) configuredLinks[count] = defaultTracker();
						configuredLinks[count].replacement = value;
						await plugin.saveSettings();
					})
				)
				.addExtraButton(btn => {
					btn.setIcon("circle-minus").onClick(async () => {
						configuredLinks.splice(count, 1);
						holder.parentNode!!.removeChild(holder);
						await plugin.saveSettings();
					});
				})
		}

		for (let x = 0; x < configuredLinks.length; x++) {
			addTracker(x);
		}
		new Setting(trackers.controlEl).addExtraButton(btn =>
			btn.setIcon("circle-plus").onClick(() => {
				addTracker(configuredLinks.length);
			})
		);
	}
}
