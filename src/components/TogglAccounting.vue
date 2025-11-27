<!--
	The main plugin view that verifies that the user has a valid Toggl token configured. If login is OK, it then
	displays the currently tracked time entry <status> and the <report-criteria> (plus activation button) via which
	a time range of tasks can be fetched & handled.
-->
<script lang="ts" setup>
import {ref} from "vue";
import {useTogglStore} from "../stores/Toggl";
import {Project as ProjectAPI, Tag as TagAPI} from "../TogglAPI";
import {DateTime} from "luxon";
import IntervalReport from "./intervalReport/Report.vue";
import Status from "./status/Status.vue";
import ReportCriteria from "./intervalReport/ReportCriteria.vue";
import {useClockifyStore} from "../stores/Clockify";

const clockifyStore = useClockifyStore();
const limitToProject = ref<ProjectAPI | undefined>(undefined);
const limitToTags = ref<TagAPI[]>([]);
const dateFrom = ref(DateTime.now().startOf("month"))
const dateTo = ref(DateTime.now().endOf("month"))


const isReportActive = ref(false)

</script>

<template>
	<div v-if="clockifyStore.loginState === 'IN_PROGRESS'">
		Logging in..
	</div>
	<div v-else-if="clockifyStore.loginState === 'NONE'">
		Please log in via settings before using this plugin.
	</div>
	<div v-else-if="clockifyStore.loginState as any == 'IN_PROGRESS' ">
		Logging you in, please wait
	</div>
	<div v-else-if="clockifyStore.loginState === 'INVALID_CREDENTIALS'">
		Your credentials seem to be invalid - please provide correct credentials before using this plugin.
	</div>
	<div v-else-if="clockifyStore.loginState === 'ERROR'">
		There was an error logging in! Try checking your internet connection.
	</div>
	<div v-else-if="clockifyStore.loginState === 'OK'">
		<div v-if="!isReportActive" class="report-builder">
			<status />


			<report-criteria v-model:dateFrom="dateFrom" v-model:dateTo="dateTo" v-model:project="limitToProject" v-model:tags="limitToTags" class="report-criteria" />
			<button @click="isReportActive = true" class="report-button">Get entries</button>

			<a class="clockify-link" href="https://app.clockify.me">Open Clockify</a>
		</div>

		<interval-report :date-from="dateFrom" :date-to="dateTo" :project="limitToProject" :tags="limitToTags" v-if="isReportActive" @close="isReportActive = false" />
	</div>
</template>

<style>
.workspace-leaf-content[data-type='toggl-accounting'] .view-content {
	padding: 0; /** Is set to var(--size-4-4) by Obsidian */
}
.report-builder {
	padding: 0 var(--size-4-4); /** We've overriden this in Obsidian */
}
.clockify-link {
	padding-top: 1em;
	text-align: center;
	display: block;
	width: 100%;
	text-decoration: none;
}
</style>
