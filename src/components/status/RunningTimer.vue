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
import {computed, onMounted} from "vue";
import Tag from "../Tag.vue";
import {DateTime} from "luxon";
import {useInterval} from "@vueuse/core";
const formatTime = shortTime
const togglStore = useTogglStore();

const timer = defineProps<{
	timer: RunningTimeEntry
}>()

const project = computed(() => timer.timer.project_id ? togglStore.project(timer.timer.project_id) : undefined)
const duration = computed(() => {
	let start = DateTime.fromISO(timer.timer.start!);
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
</script>

<template>
	<div>
		<div>
			<strong>{{timer.timer.description}}</strong>
		</div>
		<div>
			<span :style="{ color: project?.color }">{{ project?.name ?? "(no project)" }}</span>
			• {{formatTime(timer.timer.start ?? '')}} ⌛ {{ duration }}
		</div>
		<div>
			<tag :tag-id="tagId" v-for="tagId in timer.timer.tag_ids" />
		</div>
	</div>
</template>
