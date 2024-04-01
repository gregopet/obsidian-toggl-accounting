<!--
	A modal dialog from which users can choose which time entry they would like to work on next. It presents several
	previous tasks (fetched from Toggl's API) for the user to use as template (click) or use directly (double click).

	The time entry being started must have a name, can belong to a project, and can be tagged with one or more tags.

	It emits:
	- @close() -> inherited from its Obsidian modal dialog control, allows cleanup logic when dialog is closed
-->

<script lang="ts" setup>
import Modal from "../Modal.vue";
import {ref, onMounted} from "vue";
import {useTogglStore} from "../../stores/Toggl";
import ProjectSelector from "../ProjectSelector.vue";
import {DetailedReport, Project, Tag as TagAPI} from "../../TogglAPI";
import {useTimeEntriesStore} from "../../stores/TimeEntries";
import {DateTime} from "luxon";
import {useAsyncState} from "@vueuse/core";
import TagSelector from "../TagSelector.vue";
import {useCurrentStore} from "../../stores/Current";
import {useObsidanStore} from "../../stores/Obsidian";
import voca from "voca";

const props = defineProps<{
	onClose: () => any
}>();
const modal = ref();
const autofocus = ref();

const togglStore = useTogglStore();
const timeEntryStore = useTimeEntriesStore();

onMounted(() => {
	autofocus.value.focus();
})

const defaultTags = useObsidanStore().settings?.defaultTags;
const entryName = ref("");
const project = ref<Project | undefined>(undefined);
const tag = ref<TagAPI[]>([]);
const minutesAgo = ref(0);
const timeEntries = useAsyncState(
	timeEntryStore.getTimeEntries(
		DateTime.now().minus({days: 10}),
		DateTime.now().plus({hours: 3})
	).then( entries => {
		let tasks = entries.map(e => ({
			description: e.description,
			project_id: e.project_id,
			tag_ids: e.tag_ids,
			latestStart: e
				.time_entries
				.map(e => DateTime.fromISO(e.start).toMillis())
				.sort((e1, e2) => e2 - e1)
				.first()!
		}));
		return uniques(tasks).sort((e1, e2) => e2.latestStart - e1.latestStart)
	}), []
);

/** Get unique objects by stringifying and reparsing them */
function uniques<T>(array: Array<T>): Array<T> {
	return [...new Set(array.map(i => JSON.stringify(i)))].unique().map(x => JSON.parse(x)) as [T];
}

/** Get project by its id */
function getProject(projectId: number | null) {
	if (projectId == null) return null;
	return togglStore.project(projectId);
}

/** Invoked when user clicks on a tag once */
function singleTagClick(entry: any) {
	entryName.value = entry.description;
	project.value = togglStore.projects.filter(p => p.id === entry.project_id).first() ?? undefined;
	tag.value = entry.tag_ids!.map((tid: number) => togglStore.tag(tid));
}

/** Invoked when user double clicks on a tag - allows for quick task creation */
function doubleTagClick(entry: any) {
	create();
}

/** Start the time entry */
async function create() {
	if (!voca.isBlank(entryName.value)) {
		await useCurrentStore().startCurrent(entryName.value, tag.value.map(t => t.name), project.value?.id, minutesAgo.value)
		modal.value.close();
	}
}

</script>

<template>
	<modal title="What are you working on?" @close="props.onClose()" ref="modal" >
		<div @keydown.ctrl.enter="create()">
			<div class="new-entry">
				<input placeholder="Enter the timer name or select one below" ref="autofocus" v-model="entryName" type="text">
			</div>
			<div class="previous-entries">
				<ul>
					<li v-for="entry in timeEntries.state.value" v-if="timeEntries.isReady" @click="singleTagClick(entry)" @dblclick="doubleTagClick(entry)">
						<span v-text="entry.description"></span>
						<span v-text="getProject(entry.project_id)?.name ?? '(none)'" :style="{ color: (getProject(entry.project_id)?.color ?? 'gray') }"></span>
					</li>
				</ul>
			</div>
		</div>
		<div class="new-entry-modifiers">
			<project-selector v-model="project" no-selection-text="No project" />
			<span class="time-modifier">
				<label>
					<input type="number"  min="0" v-model="minutesAgo">
					minutes ago
				</label>
			</span>
			<button @click="create()">Start</button>
		</div>
		<div class="new-entry-tags">
			<tag-selector v-model="tag" :default-tags="defaultTags" />
		</div>
	</modal>
</template>


<style scoped>

	.new-entry input {
		width: 100%;
		height: var(--input-height);
		background: var(--background-modifier-form-field);
		border: var(--input-border-width) solid var(--background-modifier-border);
		padding: var(--size-4-1) var(--size-4-1);
	}


	.previous-entries ul {
		width: 100%;
		list-style-type: none;
		padding: 0;
		height: 12em;
		overflow: scroll;
	}

	.previous-entries ul li {
		display: flex;
		justify-content: space-between;
		line-height: 1.5em;
		border-radius: 0.2em;
		padding: 0.1em 0.5em;
	}

	.previous-entries ul li:hover {
		color: var(--background-primary);
		background-color: var(--text-normal);
	}

	.new-entry-modifiers {
		display: flex;
		justify-content: space-between;
	}

	.new-entry-modifiers .time-modifier input {
		width: 3em;
		text-align: center;
	}

</style>
