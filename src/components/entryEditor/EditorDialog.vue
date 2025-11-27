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
import {useTogglStore} from "../../stores/Toggl";
import {DateTime} from "luxon";
import {useTimeEntriesStore} from "../../stores/TimeEntries";
import TagSelector from "../TagSelector.vue";
import {useCurrentStore} from "../../stores/Current";
import {TimeEntryWithRatesDtoV1, useClockifyStore} from "../../stores/Clockify";

const props = defineProps<{
    onClose: () => any,
}>();

const emit = defineEmits(['deleted']);

const localDateTimeFormat = "yyyy-MM-dd'T'hh:mm";

const clockifyStore = useClockifyStore()
const originalEntry = defineModel<TimeEntryWithRatesDtoV1>();
const description = ref(originalEntry.value?.description)
const project = ref(originalEntry.value?.projectId ? clockifyStore.project(originalEntry.value.projectId) : undefined)
const start = ref(DateTime.fromISO(originalEntry.value!.timeInterval!.start!).toLocal().toFormat('yyyy-MM-dd'))
const stop = ref(originalEntry.value!.timeInterval?.end ? DateTime.fromISO(originalEntry.value!.timeInterval.end!).toLocal().toFormat('yyyy-MM-dd') : null)
const tags = ref(clockifyStore.tags.filter(t => originalEntry.value?.tagIds?.contains(t.id!)))

const modal = ref();
async function save() {

	const updated = await useTimeEntriesStore().updateTask(originalEntry.value!.id!, originalEntry.value!.workspaceId!, {
		description: description.value,
		projectId: project.value?.id,
		start: start.value,
		end: stop.value ?? undefined,
		tagIds: tags.value.map(t => t.id!),
		billable: originalEntry.value?.billable,
	})
	originalEntry.value!.description = updated.description
	originalEntry.value!.projectId = updated.projectId
	originalEntry.value!.timeInterval!.start = updated.timeInterval!.start
	originalEntry.value!.timeInterval!.end = updated.timeInterval!.end
	originalEntry.value!.tagIds = updated.tagIds
	modal.value.close();
}

async function cancel() {
	await useTimeEntriesStore().deleteEntry(originalEntry.value!.id!);
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
			<input type="datetime-local" v-model="start" id="from">
		</div>
		<div>
			<label for="to">
				Finished at
			</label>
			<input type="datetime-local" v-model="stop" id="to">
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

.modal-content>div input, .modal-content>div select, .modal-content>div>div {
	width: 60%;
}



div:first-child { border: none }
</style>
