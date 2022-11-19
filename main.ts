import {
	App,
	ItemView,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf
} from 'obsidian';
import {createApp} from "vue";
import Test from "./components/Test.vue";

interface TogglSettings {
	apiKey: string;
}

const DEFAULT_SETTINGS: TogglSettings = {
	apiKey: ''
}

const ACCOUNTING_VIEW_TYPE = "toggl-accounting";

class AccountingView extends ItemView {
	private readonly plugin: AccountingPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: AccountingPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	protected onOpen(): Promise<void> {
		const promise = super.onOpen();

		const app = createApp(Test)
		app.mount(this.contentEl)

		return promise;
	}

	getDisplayText(): string {
		return "Toggl Accounting";
	}

	getViewType(): string {
		return ACCOUNTING_VIEW_TYPE;
	}

	getIcon(): string {
		return 'sheet';
	}
}

export default class AccountingPlugin extends Plugin {
	settings: TogglSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ObsidianSettingsTab(this.app, this));

		this.registerView(ACCOUNTING_VIEW_TYPE, (leaf) => new AccountingView(leaf, this))

		// Add the view to the right sidebar
		if (this.app.workspace.layoutReady) {
			this.initLeaf();
		} else {
			this.app.workspace.onLayoutReady(this.initLeaf.bind(this));
		}

		/*
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});



		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
		*/
	}

	onunload() {

	}

	initLeaf(): void {
		if (this.app.workspace.getLeavesOfType(ACCOUNTING_VIEW_TYPE).length) {
			return;
		}
		this.app.workspace.getRightLeaf(false).setViewState({
			type: ACCOUNTING_VIEW_TYPE
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ObsidianSettingsTab extends PluginSettingTab {
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
	}
}
