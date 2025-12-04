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
	import TagSelector from "../TagSelector.vue";
	import ProjectSelector from "../ProjectSelector.vue";
	import {components} from "../../Clockify";


	const dateFrom = defineModel<DateTime>("dateFrom")
	const dateTo = defineModel<DateTime | undefined>("dateTo")
	const tags = defineModel<components["schemas"]["TagDtoV1"][]>("tags")
	const project = defineModel<components["schemas"]["ProjectDtoV1"] | undefined>("project")
</script>

<template>
	<div class="control">
		<div>
			<h3>Reports</h3>
			<div class="first-row">
				<date-selector v-model:dateFrom="dateFrom" v-model:dateTo="dateTo"></date-selector>
				&nbsp;
				<project-selector v-model="project" no-selection-text="All projects" />
			</div>

			<div>
				<tag-selector v-model="tags" />
			</div>
		</div>
	</div>
</template>

<style scoped>
	.control div div {
		width: 100%;
		margin-bottom: 0.5em;
	}
	.first-row {
		display: flex;
		justify-content: stretch;
	}

	.first-row>* { flex-grow: 1 }
</style>
