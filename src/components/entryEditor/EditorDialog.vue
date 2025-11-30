<!--
	A modal dialog via which entries can be modified: their name, tags, project and start/end times can all be
	manipulated. Currently running tasks will close automatically if their end time is set.

	It emits:
	- @deleted(entryId) -> if the entry being edited was deleted

	This dialog is still a work in progress.
-->
<script lang="ts" setup>
import Modal from "../Modal.vue";
import {hasTemporal, RunningTimeEntry, TimeEntry} from "../../TogglAPI";
import {computed, ref} from "vue";
import ProjectSelector from "../ProjectSelector.vue";
import {DateTime, Duration} from "luxon";
import {useTimeEntriesStore} from "../../stores/TimeEntries";
import TagSelector from "../TagSelector.vue";
import {TimeEntryWithRatesDtoV1, useClockifyStore} from "../../stores/Clockify";

const props = defineProps<{
    onClose: () => any,
}>();

const emit = defineEmits(['deleted']);

const clockifyStore = useClockifyStore()
const timeEntriesStore = useTimeEntriesStore()
const originalEntry = defineModel<TimeEntryWithRatesDtoV1>();
const description = ref(originalEntry.value?.description)
const project = ref(originalEntry.value?.projectId ? clockifyStore.project(originalEntry.value.projectId) : undefined)
const startDate = ref(DateTime.fromISO(originalEntry.value!.timeInterval!.start!).toLocal().toFormat('yyyy-MM-dd'))
const startTime = ref(DateTime.fromISO(originalEntry.value!.timeInterval!.start!).toLocal().toFormat('HH:mm'))
const stopDate = ref(originalEntry.value!.timeInterval?.end ? DateTime.fromISO(originalEntry.value!.timeInterval.end!).toLocal().toFormat('yyyy-MM-dd') : DateTime.now().toFormat('yyyy-MM-dd'))
const stopTime = ref(originalEntry.value!.timeInterval?.end ? DateTime.fromISO(originalEntry.value!.timeInterval.end!).toLocal().toFormat('HH:mm') : null)
const tags = ref(clockifyStore.tags.filter(t => originalEntry.value?.tagIds?.contains(t.id!)))

const modal = ref();
async function save() {

	const endTime = stopTime.value ?  Duration.fromISOTime(stopTime.value!) : null;
	const updated = await timeEntriesStore.updateTask(originalEntry.value!.id!, originalEntry.value!.workspaceId!, {
		description: description.value,
		projectId: project.value?.id,
		start: DateTime.fromFormat(startDate.value, "yyyy-MM-dd" ).plus(Duration.fromISOTime(startTime.value!)).toISO(),
		end: endTime ? DateTime.fromFormat(stopDate.value, "yyyy-MM-dd" ).plus(endTime).toISO() : undefined,
		tagIds: tags.value.map(t => t.id!),
		billable: originalEntry.value?.billable,
	})
	originalEntry.value!.description = updated.description
	originalEntry.value!.projectId = updated.projectId
	originalEntry.value!.timeInterval!.start = updated.timeInterval!.start
	originalEntry.value!.timeInterval!.end = updated.timeInterval!.end
	originalEntry.value!.tagIds = updated.tagIds

	if (endTime && timeEntriesStore.current.length && originalEntry.value!.id == timeEntriesStore.current[0]!.id) {
		timeEntriesStore.current = []
	}
	modal.value.close();
}

async function cancel() {
	await timeEntriesStore.deleteEntry(originalEntry.value!.id!);
	emit("deleted", originalEntry.value?.id)
	modal.value.close();
}
</script>

<template>
    <modal @close="props.onClose()" title="Editing time entry" ref="modal">
        <div>
			<label for="description">
				Description
			</label>
			<input v-model="description" id="description" type="text">
		</div>
		<div>
			<label for="project">Project:</label>
			<project-selector no-selection-text="none" v-model="project" />
		</div>
		<div>
			<label for="tags">Tags</label>
			<tag-selector v-model="tags" />
		</div>
		<div>
			<label for="from">
				Started at
			</label>
			<div class="two-inputs">
				<input type="date" v-model="startDate" id="from">
				<input type="text" v-model="startTime" id="fromTime">
			</div>
		</div>
		<div>
			<label for="to">
				Finished at
			</label>
			<div class="two-inputs">
				<input type="date" v-model="stopDate" id="to">
				<input type="text" v-model="stopTime" id="toTime">
			</div>
		</div>
		<div class="buttons">
			<button @click="cancel()" class="mod-destructive">Delete</button>
			<button @click="save()" class="mod-cta">Save</button>
		</div>
    </modal>
</template>

<style scoped>
.modal-content>div {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75em 0;
	border-top: 1px solid var(--background-modifier-border);
}

.modal-content>div input, .modal-content>div select, .modal-content>div>div, .two-inputs {
	width: 60%;
}

.two-inputs {
	display: flex;
}

.two-inputs input[type='text'] {
	margin-left: 1em;
	width: 5em;
}



div:first-child { border: none }
</style>
