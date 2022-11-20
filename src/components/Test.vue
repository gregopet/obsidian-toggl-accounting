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
		Hello, dear {{togglStore.me!.fullname }}. Open
		<a href="https://track.toggl.com/timer">your current Toggl timer</a>?

		<div>
			<label>
				Select date:
				<date-selector></date-selector>
			</label>
		</div>
		<div>
			<label>
				Select project:
				<project-selector v-model="limitToProject" />
			</label>
		</div>
		<div>
			<label>
				Select tags:
				<tag-selector v-model="limitToTags" />
			</label>
		</div>
		<div>
			<button @click="getTimeEntries()">Get entries</button>

			<summary-and-controls :entries="selectedTimeEntries" @entriesChanged="getTimeEntries()"></summary-and-controls>
			<table>
				<thead>
					<tr>
						<th></th>
						<th style="text-align: right">Time</th>
						<th style="text-align: left; padding-left: 1em">Entry</th>
					</tr>
				</thead>
				<tbody>
					<template v-for="(entry, idx) in timeEntries">
						<tr v-if="idx === 0 || !onSameDay(entry, timeEntries[idx-1])">
							<td colspan="3" style="text-align: center">
								{{ dateToDay(entry.at) }}
							</td>
						</tr>
						<tr>
							<td><input type="checkbox" v-model="entry.selected" :id="'time-entry-' + entry.id"></td>
							<td style="text-align: right">
								<label :for="'time-entry-' + entry.id" style="display: block">
									{{secondsToString(entry.seconds)}}
								</label>
							</td>
							<td style="padding-left: 1em">
								{{ entry.description }}
								<div>
									<project v-if="entry.project_id" :project-id="entry.project_id"></project>
									<span v-if="entry.project_id && entry.tag_ids.length"> • </span>
									<tag v-for="tagId in entry.tag_ids" :tag-id="tagId"></tag>
								</div>
							</td>
						</tr>
					</template>
				</tbody>
			</table>
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
import Tag from "./Tag.vue";
import Project from "./Project.vue";
import ProjectSelector from "./ProjectSelector.vue";
import TagSelector from "./TagSelector.vue";
import SelectableTimeEntry, {createSelectableTimeEntries} from "./SelectableTimeEntry";
import SummaryAndControls from "./SummaryAndControls.vue";
import { secondsToString as secToStr } from "./formatters";

const secondsToString = secToStr;
const togglStore = useTogglStore();
const timeEntriesStore = useTimeEntriesStore();
const timeEntries = ref<SelectableTimeEntry[]>([]);
const selectedTimeEntries = computed(() => timeEntries.value.filter((t) => t.selected));
const limitToProject = ref<ProjectAPI | null>(null);
const limitToTags = ref<TagAPI[]>([]);

function dateToDay(date: string): string {
	return DateTime.fromISO(date).toLocaleString()
}

async function getTimeEntries() {
	const tagIds = limitToTags.value.map( (t) => t.id);
	timeEntries.value = createSelectableTimeEntries(
		await timeEntriesStore.getTimeEntries(limitToProject.value?.id, tagIds) as DetailedReport[]
	);
}

/** Do the two time entries take place on the same day? */
function onSameDay(a: SelectableTimeEntry, b: SelectableTimeEntry): boolean {
	return DateTime.fromISO(a.at).toISODate() == DateTime.fromISO(b.at).toISODate()
}

</script>

<style scoped>

</style>
