<!--
	A modal dialog via which entries can be modified: their name, tags, project and start/end times can all be
	manipulated. Currently running tasks will close automatically if their end time is set.

	This dialog is still a work in progress.
-->
<script lang="ts" setup>
import Modal from "../Modal.vue";
import {RunningTimeEntry, TimeEntry} from "../../TogglAPI";
import {computed, ref} from "vue";
import ProjectSelector from "../ProjectSelector.vue";
import {useTogglStore} from "../../stores/Toggl";
import {DateTime} from "luxon";
import {useTimeEntriesStore} from "../../stores/TimeEntries";
import TagSelector from "../TagSelector.vue";
import {useCurrentStore} from "../../stores/Current";

const props = defineProps<{
    onClose: () => any,
}>();

const localDateTimeFormat = "yyyy-MM-dd'T'hh:mm";

const togglStore = useTogglStore()
const originalEntry = defineModel<RunningTimeEntry>();
const description = ref(originalEntry.value?.description)
const project = ref(originalEntry.value?.project_id ? togglStore.project(originalEntry.value.project_id) : undefined)
const start = ref(DateTime.fromISO(originalEntry.value!.start!).toLocal().toFormat('yyyy-MM-dd\'T\'HH:mm'))
const stop = ref(originalEntry.value!.stop ? DateTime.fromISO(originalEntry.value!.stop!).toLocal().toFormat(localDateTimeFormat) : null)
const tags = ref(togglStore.tags.filter(t => originalEntry.value?.tag_ids?.contains(t.id)))

const modal = ref();
async function save() {
	const updated = await useTimeEntriesStore().updateTask({
		id: originalEntry.value!.id,
		description: description.value,
		project_id: project.value?.id,
		start: DateTime.fromFormat(start.value, localDateTimeFormat, { zone: 'system' }).toISO(),
		stop: stop.value ? DateTime.fromFormat(stop.value, localDateTimeFormat, { zone: 'system' }).toISO() : undefined,
		tags: tags.value.map(t => t.name),
	})
	originalEntry.value!.description = updated.description
	originalEntry.value!.project_id = updated.project_id
	originalEntry.value!.start = updated.start
	originalEntry.value!.stop = updated.stop
	originalEntry.value!.tag_ids = updated.tag_ids
	modal.value.close();
}

async function cancel() {
	await useTimeEntriesStore().deleteEntry(originalEntry.value!.id);
	modal.value.close();
	await useCurrentStore().refreshCurrent();
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
			<button @click="cancel()" class="mod-warning">Delete</button>
			<button @click="save()">Save</button>
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
