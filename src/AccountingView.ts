import {ItemView, WorkspaceLeaf} from "obsidian";
import {createApp} from "vue";
import Test from "./components/TogglAccounting.vue";
import {createPinia} from "pinia";
import AccountingPlugin from "./main";
import {useObsidanStore} from "./stores/Obsidian";
import ObsidianSettingsTab from "./SettingsTab";
import { useTimeEntriesStore } from "./stores/TimeEntries";
import {useClockifyStore} from "./stores/Clockify";

export const ACCOUNTING_VIEW_TYPE = "clockify-accounting";

/** Creates a side display where we can do our accounting */
export default class AccountingView extends ItemView {
	private readonly plugin: AccountingPlugin;
	private readonly settings: ObsidianSettingsTab;

	constructor(leaf: WorkspaceLeaf, plugin: AccountingPlugin, settings: ObsidianSettingsTab) {
		super(leaf);
		this.plugin = plugin;
		this.settings = settings;
	}

	protected onOpen(): Promise<void> {
		const promise = super.onOpen();

		const app = createApp(Test)
		app.use(createPinia())
		useObsidanStore().registerApp(this.app, this.plugin, this.plugin.settings)
		app.mount(this.contentEl)
		useClockifyStore().login(this.plugin.settings.apiKey).then(() => {
			useTimeEntriesStore().refreshCurrent()
			this.registerInterval(
				window.setInterval(() => useTimeEntriesStore().refreshCurrent(), 10000)
			)
		})

		return promise;
	}

	getDisplayText(): string {
		return "Clockify Accounting";
	}

	getViewType(): string {
		return ACCOUNTING_VIEW_TYPE;
	}

	getIcon(): string {
		return 'sheet';
	}
}
