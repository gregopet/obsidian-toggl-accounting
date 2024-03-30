<!--
	A view of time entries that can be ticked & updated with different tags.
	It accepts following properties via which reports were selected:
	- dateFrom
	- dateTo
	- tags
	- projects

	It also emits the following signals:
	- close() -> when user wants to close the view
-->

<template>
	<div>
		<a href="#" @click="emit('close')">Close</a>
		<summary-and-controls :entries="selectedTimeEntries" @entriesChanged="getTimeEntries()"></summary-and-controls>
		<table>
			<tbody>
				<template v-for="(entry, idx) in timeEntries">
					<tr v-if="idx === 0 || !onSameDay(entry, timeEntries[idx-1])">
						<td colspan="3" class="date-row">
							{{ formatDay(entry.start) }}
						</td>
					</tr>
					<tr :title="fromToTitle(entry)">
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
</template>

<script lang="ts" setup>

import Tag from "../Tag.vue";
import Project from "../Project.vue";
import {secondsToString as secToStr} from "../../display/duration";
import SelectableTimeEntry, {createSelectableTimeEntries} from "./SelectableTimeEntry";
import {DateTime} from "luxon";
import {shortTime, longDate} from "../../display/time";
import SummaryAndControls from "./SummaryAndControls.vue";
import {DetailedReport, Project as ProjectAPI, Tag as TagAPI } from "../../TogglAPI";
import {computed, onMounted, ref} from "vue";
import {useTimeEntriesStore} from "../../stores/TimeEntries";

const emit = defineEmits(["close"])

const timeEntriesStore = useTimeEntriesStore();
const secondsToString = secToStr;
const formatDay = longDate;

onMounted(() => {
	getTimeEntries()
})

const props = defineProps<{
	dateFrom: DateTime,
	dateTo: DateTime,
	tags: TagAPI[],
	project: ProjectAPI | undefined,
}>()

/** The time entries that were pulled from Toggl API */
const timeEntries = ref<SelectableTimeEntry[]>([]);

/** The time entries that were selected by the user */
const selectedTimeEntries = computed(() => timeEntries.value.filter((t) => t.selected));

/** Do the two time entries take place on the same day? */
function onSameDay(a: SelectableTimeEntry, b: SelectableTimeEntry): boolean {
	return DateTime.fromISO(a.start).toISODate() == DateTime.fromISO(b.start).toISODate()
}

function fromToTitle(entry: SelectableTimeEntry): string {
	return `${shortTime(entry.start)} - ${shortTime(entry.stop)}`;
}

/** Use the store to get the time entries */
async function getTimeEntries() {
	const tagIds = props.tags.map( (t) => t.id);
	timeEntries.value = createSelectableTimeEntries(
		await timeEntriesStore.getTimeEntries(props.dateFrom, props.dateTo, props.project?.id, tagIds) as DetailedReport[]
	).sort( (a, b) => a.start.localeCompare(b.start)); // Data is probably pre-sorted already, but just in case!
}
</script>


<style scoped>
.date-row {
	text-align: center;
	font-size: 16px;
	padding-top: 1em;
	padding-bottom: 0.25em;
	font-weight: bold;
}
</style>
