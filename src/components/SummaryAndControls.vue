<script lang="ts" setup>

/*
 * A box displaying the total selected time and offers controls to add or remove tags on selected tasks.
 * Emits a 'entriesChanged' event when it had caused a change the rest of the plugin should be aware of.
 */
import SelectableTimeEntry from "./SelectableTimeEntry";
import {computed} from "vue";
import {Tag as TagAPI} from "../TogglAPI";
import {useTogglStore} from "../stores/Toggl";
import { secondsToString as secToStr } from "./formatters";
import {useTimeEntriesStore} from "../stores/TimeEntries";
import Tag from "./Tag.vue";

interface TagWithCounts {
	tag: TagAPI;
	entriesWithTag: number;
}

const props = defineProps<{
	entries: SelectableTimeEntry[]
}>()
const emit = defineEmits(["entriesChanged"])
const secondsToString = secToStr;
const togglStore = useTogglStore();
const timeEntriesStore = useTimeEntriesStore();

/** Summed time entries */
const selectedTime = computed(() => props.entries.reduce((acc, entry) => acc + entry.seconds, 0));

/** Counts how many entries there are for each tag. */
const tagsWithCounts = computed<TagWithCounts[]>(() =>
	togglStore.tags.map((tag) => {
		return {
			tag: tag,
			entriesWithTag: props.entries.filter( (entry) =>
				entry.tag_ids.some( (tagId) => tagId === tag.id)
			).length ?? 0
		}
	})
)
const tagsWithNonZeroCounts = computed(() => tagsWithCounts.value.filter((t) => t.entriesWithTag > 0) )
const tagsNotPresentOnAllEntries = computed(() => tagsWithCounts.value.filter((t) => t.entriesWithTag < props.entries.length) )

/** Removes [tag] from the currently selected time entries */
async function removeTag(tag: TagAPI) {
	const timeEntryIds = props.entries.map( (t) => t.id);
	await timeEntriesStore.removeTag(timeEntryIds, tag)
	emit("entriesChanged")
}

/** Adds [tag] to the currently selected time entries */
async function addTag(tag: TagAPI) {
	const timeEntryIds = props.entries.map( (t) => t.id);
	await timeEntriesStore.addTag(timeEntryIds, tag)
	emit("entriesChanged")
}
</script>


<template>
	<div class="tally-box">
		<h3 v-if="entries?.length">Total selected time: {{secondsToString(selectedTime)}}</h3>
		<h3 v-else>No entries selected</h3>
		<div v-if="tagsWithNonZeroCounts.length > 0">
			Remove tag:
			<button @click="removeTag(tag.tag)" v-for="tag in tagsWithNonZeroCounts">
				<tag :tag-id="tag.tag.id"></tag>
				&nbsp;({{ tag.entriesWithTag }}/{{ props.entries.length }})
			</button>
		</div>
		<div v-if="tagsNotPresentOnAllEntries.length > 0">
			Add tag:
			<button @click="addTag(tag.tag)" v-for="tag in tagsNotPresentOnAllEntries">
				<tag :tag-id="tag.tag.id"></tag>
				&nbsp;({{ props.entries.length - tag.entriesWithTag }}/{{ props.entries.length }})
			</button>
		</div>
	</div>
</template>

<style scoped>
.tally-box {
	position: sticky;
	top: 20px;

	background-color: var(--background-secondary);
	border: var(--input-border-width) solid var(--background-modifier-border);
	z-index: 50;
	margin: 1.5em 0;
	padding: 0.75em;
}
</style>
