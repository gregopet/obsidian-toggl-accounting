<template>
	<select v-model="project" @change="emitChange" :style="{ color: project ? project.color : undefined }">
		<option :selected="!project" :value="null" style="color: var(--text-normal)">All projects</option>
		<option v-for="p in togglStore.projects" :selected="project != null && project.id === p.id" :value="p" :style="{ color: p.color }">
			{{ p.name }}
		</option>
	</select>
</template>
<script lang="ts" setup>
/* Allows users to pick a single project */
import {useTogglStore} from "../stores/Toggl";
import {Project} from "../TogglAPI";
import {ref} from "vue";

const togglStore = useTogglStore()
const props = defineProps<{
	modelValue: Project | null;
}>()
const emit = defineEmits(["update:modelValue"])
const project = ref(props.modelValue)
function emitChange() {
	emit("update:modelValue", project.value)
}

</script>
