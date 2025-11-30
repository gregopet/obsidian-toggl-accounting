<!--
	A simple control that renders a project via its ID (the project is fetched automatically from the Clockify API). It
	accepts a single property:
	- projectId: ID of the project to render
-->

<script lang="ts" setup>
import {computed} from "vue";
import {useClockifyStore} from "../stores/Clockify";

const props = defineProps<{
	projectId: string;
}>()
const project = computed(() => useClockifyStore().project(props.projectId))
</script>
<template>
	<span :style="{ color: project.color}">
		{{ project.name }}
	</span>
</template>
