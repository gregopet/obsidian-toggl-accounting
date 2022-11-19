<template>
	<span :style="{ color: project.color}">
		{{ project.name }}
	</span>
</template>
<script lang="ts" setup>
import {useTogglStore} from "../stores/Toggl";
import {computed} from "vue";

const props = defineProps<{
	projectId: number;
}>()
const project = computed(() => useTogglStore().project(props.projectId))
</script>
