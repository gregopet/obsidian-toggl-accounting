import {Plugin} from 'obsidian';
import ObsidianSettingsTab from "./SettingsTab";
import AccountingView, {ACCOUNTING_VIEW_TYPE} from "./AccountingView";
import {DEFAULT_SETTINGS, Settings} from "./Settings";
import {useTogglStore} from "./stores/Toggl";


export default class AccountingPlugin extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		const settings = new ObsidianSettingsTab(this.app, this);
		this.addSettingTab(settings);

		this.registerView(ACCOUNTING_VIEW_TYPE, (leaf) => new AccountingView(leaf, this, settings))

		// Add the display to the right sidebar
		if (this.app.workspace.layoutReady) {
			this.initLeaf();
		} else {
			this.app.workspace.onLayoutReady(this.initLeaf.bind(this));
		}

		// Add command to open the sidebar
		this.addCommand({
			id: "toggl-accounting-open-sidebar",
			name: "Open sidebar",
			callback: () => {
				const leaf = this.app.workspace.getLeavesOfType(ACCOUNTING_VIEW_TYPE)[0];
				if (leaf) {
					this.app.workspace.setActiveLeaf(leaf)
				}
			}
		})

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

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, display: MarkdownView) => {
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
		const togglstore = useTogglStore();
		if (togglstore.didApiKeyChange(this.settings.apiKey)) {
			useTogglStore().login(this.settings.apiKey);
		}
	}
}
