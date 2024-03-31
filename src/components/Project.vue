<!--
	A simple control that renders a project via its ID (the project is fetched automatically from the Toggl API). It
	accepts a single property:
	- projectId: ID of the project to render
-->

<script lang="ts" setup>
import {useTogglStore} from "../stores/Toggl";
import {computed} from "vue";

const props = defineProps<{
	projectId: number;
}>()
const project = computed(() => useTogglStore().project(props.projectId))
</script>
<template>
	<span :style="{ color: project.color}">
		{{ project.name }}
	</span>
</template>
