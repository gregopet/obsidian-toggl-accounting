<!--
	A control that displays the criteria for reports on which users can then do accounting. It accepts multiple model
	properties:
	- dateFrom
	- dateTo
	- tags
	- projects
-->
<script lang="ts" setup>
	import {defineModel} from 'vue';
	import DateSelector from "../DateSelector.vue";
	import {DateTime} from "luxon";
	import { Project, Tag } from "../../TogglAPI";
	import TagSelector from "../TagSelector.vue";
	import ProjectSelector from "../ProjectSelector.vue";


	const dateFrom = defineModel<DateTime>("dateFrom")
	const dateTo = defineModel<DateTime | undefined>("dateTo")
	const tags = defineModel<Tag[]>("tags")
	const project = defineModel<Project | undefined>("project")
</script>

<template>
	<div>
		Reports from
		<date-selector v-model:dateFrom="dateFrom" v-model:dateTo="dateTo"></date-selector>
		for
		<project-selector v-model="project" no-selection-text="All projects" />
	</div>
	<div>
		<tag-selector v-model="tags" />
	</div>
</template>
