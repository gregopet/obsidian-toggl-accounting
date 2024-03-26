<template>
	<div v-if="togglStore.loginState === 'IN_PROGRESS'">
		Logging in..
	</div>
	<div v-else-if="togglStore.loginState === 'NONE'">
		Please log in via settings before using this plugin.
	</div>
	<div v-else-if="togglStore.loginState as any == 'IN_PROGRESS' ">
		Logging you in, please wait
	</div>
	<div v-else-if="togglStore.loginState === 'INVALID_CREDENTIALS'">
		Your credentials seem to be invalid - please provide correct credentials before using this plugin.
	</div>
	<div v-else-if="togglStore.loginState === 'ERROR'">
		There was an error logging in! Try checking your internet connection.
	</div>
	<div v-else-if="togglStore.loginState === 'OK'">
		<status />

		<div>
			Select date:
			<date-selector v-model:dateFrom="dateFrom" v-model:dateTo="dateTo"></date-selector>
		</div>
		<div>
			<label>
				Select project:
				<project-selector v-model="limitToProject" no-selection-text="All projects" />
				<project-selector v-model="limitToProject" no-selection-text="All projects" />
			</label>
		</div>
		<div>
			<label>
				Select tags:
				<tag-selector v-model="limitToTags" />

				<tag-selector v-model="limitToTags" />
			</label>
		</div>
		<div>
			<button @click="getTimeEntries()">Get entries</button>
			<summary-and-controls :entries="selectedTimeEntries" @entriesChanged="getTimeEntries()"></summary-and-controls>
			<interval-report :time-entries="timeEntries" v-if="timeEntries" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import {computed, ref} from "vue";
import {useTogglStore} from "../stores/Toggl";
import DateSelector from "./DateSelector.vue";
import {useTimeEntriesStore} from "../stores/TimeEntries";
import {DetailedReport, Project as ProjectAPI, Tag as TagAPI} from "../TogglAPI";
import {DateTime} from "luxon";
import ProjectSelector from "./ProjectSelector.vue";
import TagSelector from "./TagSelector.vue";
import SelectableTimeEntry, {createSelectableTimeEntries} from "./intervalReport/SelectableTimeEntry";
import SummaryAndControls from "./intervalReport/SummaryAndControls.vue";
import EditorDialog from "./entryEditor/EditorDialog.vue";
import IntervalReport from "./intervalReport/IntervalReport.vue";
import Status from "./status/Status.vue";

const togglStore = useTogglStore();
const timeEntriesStore = useTimeEntriesStore();
const timeEntries = ref<SelectableTimeEntry[]>([]);
const selectedTimeEntries = computed(() => timeEntries.value.filter((t) => t.selected));
const limitToProject = ref<ProjectAPI | null>(null);
const limitToTags = ref<TagAPI[]>([]);
const dateFrom = ref(DateTime.now().startOf("month"))
const dateTo = ref(DateTime.now().endOf("month"))





async function getTimeEntries() {
	const tagIds = limitToTags.value.map( (t) => t.id);
	timeEntries.value = createSelectableTimeEntries(
		await timeEntriesStore.getTimeEntries(dateFrom.value, dateTo.value, limitToProject.value?.id, tagIds) as DetailedReport[]
	).sort( (a, b) => a.start.localeCompare(b.start)); // Data is probably pre-sorted already, but just in case!
}
</script>
