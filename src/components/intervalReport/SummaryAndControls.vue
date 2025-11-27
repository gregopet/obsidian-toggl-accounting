<!--
	A box that accepts a range of time entries and displays their total time. It also allows removing one or more of
	their tags by pressing a button (only buttons for tags actually present on the tasks will be offered) or assign
	them additional tags found on previous time entries.

	Accepts following properties:
	- entries: the time entries to display

	Emits:
	- entriesChanged() -> some entries were updated
	- selectAll() -> user clicked the "select all" button
	- unselectAll() -> user clicked the "unselect all" button
-->
<script lang="ts" setup>

import SelectableTimeEntry from "./SelectableTimeEntry";
import {computed} from "vue";
import { secondsToString as secToStr, durationToString as durToString } from "../../display/duration";
import {useTimeEntriesStore} from "../../stores/TimeEntries";
import Tag from "../Tag.vue";
import {DateTime, Duration} from "luxon";
import {shortDateFormatOpts} from "../../display/time";
import {components} from "../../Clockify";
import {useClockifyStore} from "../../stores/Clockify";

const props = defineProps<{
	entries: SelectableTimeEntry[]
}>()
const emit = defineEmits(["entriesChanged", "selectAll", "unselectAll"])

interface TagWithCounts {
	tag: components["schemas"]["TagDtoV1"];
	entriesWithTag: number;
}

const secondsToString = secToStr;
const durationToString = durToString;
const clockifyStore = useClockifyStore();
const timeEntriesStore = useTimeEntriesStore();

/** Summed time entries */
const selectedTime = computed(() => props.entries.reduce((acc, entry) => acc.plus(Duration.fromISO(entry.timeInterval!.duration!)), Duration.fromMillis(0)));
const earliestDay = computed(() => {
	const earliest = props.entries.map(e => DateTime.fromISO(e.timeInterval!.start!)).reduce((acc, candidate) => acc && acc < candidate ? acc : candidate)
	return earliest?.toLocaleString(shortDateFormatOpts);
})
const latestDay = computed(() => {
	const latest = props.entries.map(e => DateTime.fromISO(e.timeInterval!.start!)).reduce((acc, candidate) => acc && acc > candidate ? acc : candidate)
	return latest?.toLocaleString(shortDateFormatOpts);
})

/** Counts how many entries there are for each tag. */
const tagsWithCounts = computed<TagWithCounts[]>(() =>
	clockifyStore.tags.map((tag) => {
		return {
			tag: tag,
			entriesWithTag: props.entries.filter( (entry) =>
				entry.tagIds!.some( (tagId) => tagId === tag.id)
			).length ?? 0
		}
	})
)
const tagsWithNonZeroCounts = computed(() => tagsWithCounts.value.filter((t) => t.entriesWithTag > 0) )
const tagsNotPresentOnAllEntries = computed(() => tagsWithCounts.value.filter((t) => t.entriesWithTag < props.entries.length) )

/** Removes [tag] from the currently selected time entries */
async function removeTag(tag: components["schemas"]["TagDtoV1"]) {
	await timeEntriesStore.removeTag(props.entries, tag)
	emit("entriesChanged")
}

/** Adds [tag] to the currently selected time entries */
async function addTag(tag: components["schemas"]["TagDtoV1"]) {
	const timeEntryIds = props.entries.map( (t) => t.id!);
	await timeEntriesStore.addTag(props.entries, tag)
	emit("entriesChanged")
}
</script>


<template>
	<div class="tally-box">
		<div v-if="entries?.length" class="totals">
			<h3>Total selected: {{durationToString(selectedTime.toString())}}</h3>
			<small>
				<span>{{earliestDay}}</span>
				<span v-if="earliestDay != latestDay"> - {{latestDay}}</span>
			</small>
		</div>
		<h3 v-else>No entries selected</h3>
		<div v-if="tagsWithNonZeroCounts.length > 0">
			Remove tag:
			<button @click="removeTag(tag.tag)" v-for="tag in tagsWithNonZeroCounts">
				<tag :tag-id="tag.tag.id!"></tag>
				&nbsp;({{ tag.entriesWithTag }}/{{ props.entries.length }})
			</button>
		</div>
		<div v-if="tagsNotPresentOnAllEntries.length > 0">
			Add tag:
			<button @click="addTag(tag.tag)" v-for="tag in tagsNotPresentOnAllEntries">
				<tag :tag-id="tag.tag.id!"></tag>
				&nbsp;({{ props.entries.length - tag.entriesWithTag }}/{{ props.entries.length }})
			</button>
		</div>
		<div class="selections">
			<a href="#" @click.prevent="emit('selectAll')">Select all</a>
			<a href="#" @click.prevent="emit('unselectAll')">Select none</a>
		</div>
	</div>
</template>

<style scoped>
.totals {
	margin-bottom: 1.5em;
}
.totals h3 {
	margin-bottom: 0;
}
.totals small {
	margin-left: 0.1em;
}

.tally-box {
	position: sticky;
	top: 0px;

	background-color: var(--background-secondary);
	border: var(--input-border-width) solid var(--background-modifier-border);
	z-index: 50;
	padding: 0.75em;
}

.selections {
	padding-top: 1.5em;
	display: flex;
	justify-content: space-between;
}

.selections a {
	text-decoration: none;
}
</style>
