<template>
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
</template>

<script lang="ts" setup>

import Tag from "../Tag.vue";
import Project from "../Project.vue";
import {secondsToString as secToStr} from "../../display/duration";
import SelectableTimeEntry from "./SelectableTimeEntry";
import {DateTime} from "luxon";
import {shortTime, longDate} from "../../display/time";

const secondsToString = secToStr;
const formatDay = longDate;

const props = defineProps<{
	timeEntries: SelectableTimeEntry[]
}>()

/** Do the two time entries take place on the same day? */
function onSameDay(a: SelectableTimeEntry, b: SelectableTimeEntry): boolean {
	return DateTime.fromISO(a.start).toISODate() == DateTime.fromISO(b.start).toISODate()
}

function fromToTitle(entry: SelectableTimeEntry): string {
	return `${shortTime(entry.start)} - ${shortTime(entry.stop)}`;
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
