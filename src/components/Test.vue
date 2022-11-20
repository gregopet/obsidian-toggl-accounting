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
			<h3>Total selected time: {{secondsToString(selectedTime)}}</h3>
			<ul>
				<li v-for="tag in selectedTags">
					<button @click="removeTag(tag.tag)">
						<tag :tag-id="tag.tag.id"></tag>
						({{ tag.entriesWithTag }}/{{ selectedTimeEntries.length }})
					</button>
				</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts" setup>
import {computed, ref} from "vue";
import {useTogglStore} from "../stores/Toggl";
import DateSelector from "./DateSelector.vue";
import {useTimeEntriesStore} from "../stores/TimeEntries";
import {DetailedReport, TimeEntry, Project as ProjectAPI, Tag as TagAPI} from "../TogglAPI";
import {DateTime, Duration} from "luxon";
import Tag from "./Tag.vue";
import Project from "./Project.vue";
import ProjectSelector from "./ProjectSelector.vue";
import TagSelector from "./TagSelector.vue";

const togglStore = useTogglStore();
const timeEntriesStore = useTimeEntriesStore();
const timeEntries = ref<SelectableTimeEntry[]>([]);
const selectedTimeEntries = computed(() => timeEntries.value.filter((t) => t.selected));
const limitToProject = ref<ProjectAPI | null>(null);
const limitToTags = ref<TagAPI[]>([]);
const selectedTime = computed(() => selectedTimeEntries.value.reduce((acc, entry) => acc + entry.seconds, 0));
const selectedTags = computed<SelectedTag[]>(() => {
	const tagCounter: { [tagId: string]: number } = {};
	selectedTimeEntries.value.forEach((entry) => {
		entry.tag_ids.forEach((tagId) => {
			const tagIdStr = tagId.toString();
			if (!tagCounter[tagIdStr]) {
				tagCounter[tagIdStr] = 1;
			} else {
				tagCounter[tagIdStr] = tagCounter[tagIdStr] + 1;
			}
		})
	})
	return Object.keys(tagCounter).map((key) => {
		return {
			tag: togglStore.tag(parseInt(key, 10)),
			entriesWithTag: tagCounter[key]
		}
	})
})

interface SelectableTimeEntry extends TimeEntry {
	selected: boolean | undefined;
}

interface SelectedTag {
	tag: TagAPI;
	entriesWithTag: number;
}

function secondsToString(seconds: number) {
	const dur = Duration.fromMillis(seconds * 1000).normalize();
	const format = dur.as('hours') > 1 ? "h'h' m'm'" : "m'm'";
	return dur.toFormat(format);
}

function dateToDay(date: string): string {
	return DateTime.fromISO(date).toLocaleString()
}

async function getTimeEntries() {
	const tagIds = limitToTags.value.map( (t) => t.id);
	const freshEntries = await timeEntriesStore.getTimeEntries(limitToProject.value?.id, tagIds) as DetailedReport[];
	const newTimeEntries: SelectableTimeEntry[] = [];
	freshEntries.forEach( (entry) => {
		entry.time_entries.forEach( (temporal) => {
			newTimeEntries.push({
				selected: false,
				...temporal,
				...entry,
			})
		})
	})
	timeEntries.value = newTimeEntries;
}

/** Removes [tag] from the currently selected time entries */
async function removeTag(tag: TagAPI) {
	const timeEntryIds = selectedTimeEntries.value.map( (t) => t.id);
	await timeEntriesStore.removeTag(timeEntryIds, tag)
	getTimeEntries()
}

/** Do the two time entries take place on the same day? */
function onSameDay(a: SelectableTimeEntry, b: SelectableTimeEntry): boolean {
	return DateTime.fromISO(a.at).toISODate() == DateTime.fromISO(b.at).toISODate()
}

</script>
