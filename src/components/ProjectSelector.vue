<!--
	Renders an HTML <select> from which users can choose one project. The available projects will be fetched from the
	Toggl API automatically. It accepts a single property:
	- noSelectionText: what text to display in case the current v-model is undefined?
-->
<script lang="ts" setup>
/* Allows users to pick a single project */
import {useTogglStore} from "../stores/Toggl";
import {Project} from "../TogglAPI";
import { defineModel } from "vue";
import {useObsidanStore} from "../stores/Obsidian";
import {useClockifyStore} from "../stores/Clockify";
import {components} from "../Clockify";

const togglStore = useClockifyStore()
const model = defineModel<components["schemas"]["ProjectDtoV1"] | undefined>();

const props = defineProps<{
	noSelectionText: string | null;
}>()
</script>

<template>
	<select v-model="model" :style="{ color: model ? model.color : undefined }">
		<option :selected="!model" :value="undefined" v-text="noSelectionText"></option>
		<option v-for="p in togglStore.projects" :selected="model != undefined && model.id === p.id" :value="p" :style="{ color: p.color }">
			{{ p.name }}
		</option>
	</select>
</template>

<style scoped>
option {
	color: var(--text-normal);
}
</style>
