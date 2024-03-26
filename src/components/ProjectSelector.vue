<template>
	<select v-model="model" :style="{ color: model ? model.color : undefined }">
		<option :selected="!model" :value="null" v-text="noSelectionText"></option>
		<option v-for="p in togglStore.projects" :selected="model != null && model.id === p.id" :value="p" :style="{ color: p.color }">
			{{ p.name }}
		</option>
	</select>
</template>
<script lang="ts" setup>
/* Allows users to pick a single project */
import {useTogglStore} from "../stores/Toggl";
import {Project} from "../TogglAPI";
import {ref, defineModel } from "vue";

const togglStore = useTogglStore()
const model = defineModel<Project>();

const props = defineProps<{
	noSelectionText: string | null;
}>()
</script>

<style scoped>
option {
	color: var(--text-normal);
}
</style>
