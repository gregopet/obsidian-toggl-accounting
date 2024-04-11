<!--
	A control that displays a currently running timer. The task's name, tags, project, start time and current duration
	are displayed.

	It accepts the following properties:
	- timer: the running timer to display
-->
<script lang="ts" setup>
import {RunningTimeEntry} from "../../TogglAPI";
import {shortTime} from "../../display/time";
import {useTogglStore} from "../../stores/Toggl";
import {computed, onMounted, ref} from "vue";
import Tag from "../Tag.vue";
import {DateTime} from "luxon";
import {useInterval} from "@vueuse/core";
import EditorDialog from "../entryEditor/EditorDialog.vue";
const formatTime = shortTime
const togglStore = useTogglStore();

const props = defineProps<{
	timer: RunningTimeEntry
}>()

const project = computed(() => props.timer.project_id ? togglStore.project(props.timer.project_id) : undefined);
const duration = computed(() => {
	let start = DateTime.fromISO(props.timer.start!);
	if (start > DateTime.now()) start = DateTime.now();
	const diff = DateTime.now().diff(start);
	diff.minus({milliseconds: counter.value % 1}); // make the value update together with the timer
	let format: string;
	if (diff.toMillis() < 60 * 1000) {
		format = "s 's'";
	} else if (diff.toMillis() < 60 * 60 * 1000) {
		format = "m 'min'";
	} else {
		format = "h:mm";
	}

	return diff.toFormat(format)
});
const counter = useInterval(400)

const editing = ref(false);
function edit() {
	editing.value = true;
}
</script>

<template>
	<div>
		<div>
			<strong>{{ props.timer.description }}</strong>
			<span @click="edit()">✎</span>
		</div>
		<div>
			<span :style="{ color: project?.color }">{{ project?.name ?? "(no project)" }}</span>
			⌛ {{ duration }}
		</div>
		<div>
			<tag :tag-id="tagId" v-for="tagId in props.timer.tag_ids" />
		</div>
		<editor-dialog v-if="editing" @close="editing = false" v-model="props.timer" />
	</div>
</template>
