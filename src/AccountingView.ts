import {ItemView, WorkspaceLeaf} from "obsidian";
import {createApp} from "vue";
import Test from "./components/Test.vue";
import {createPinia} from "pinia";
import AccountingPlugin from "./main";
import {useObsidanStore} from "./stores/Obsidian";
import ObsidianSettingsTab from "./SettingsTab";
import {useTogglStore} from "./stores/Toggl";

export const ACCOUNTING_VIEW_TYPE = "toggl-accounting";

/** Creates a side view where we can do our accounting */
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
		useObsidanStore().registerApp(this.app, this.plugin)
		app.mount(this.contentEl)
		useTogglStore().login(this.plugin.settings.apiKey);

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
