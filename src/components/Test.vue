<template>
	<div v-if="togglStore.loginState === 'IN_PROGRESS'">
		Logging in..
	</div>
	<div v-else-if="togglStore.loginState === 'NONE'">
		Please log in via settings before using this plugin.
	</div>
	<div v-else-if="togglStore.loginState as any == 'IN_PROGRESS' ">
		Logging you in, please wait
	</div>
	<div v-else-if="togglStore.loginState === 'INVALID_CREDENTIALS'">
		Your credentials seem to be invalid - please provide correct credentials before using this plugin.
	</div>
	<div v-else-if="togglStore.loginState === 'ERROR'">
		There was an error logging in! Try checking your internet connection.
	</div>
	<div v-else-if="togglStore.loginState === 'OK'">
		Hello, dear {{togglStore.me!.fullname }}. Open
		<a href="https://track.toggl.com/timer">your current Toggl timer</a>?

		<div>
			<label>
				Select date:
				<date-selector></date-selector>
			</label>
		</div>
		<div>
			<label>
				Select project:
				<project-selector v-model="limitToProject" />
			</label>
		</div>
		<div>
			<label>
				Select tags:
				<tag-selector v-model="limitToTags" />
			</label>
		</div>
		<div>
			<button @click="getTasks()">Get tasks!</button>

			<table>
				<thead>
					<tr>
						<th></th>
						<th>Task</th>
						<th>Date</th>
						<th>Time</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="task in tasks" :id="task.id.toString()">
						<td><input type="checkbox" v-model="task.selected"></td>
						<td>
							{{ task.description }}
							<div>
								<project v-if="task.project_id" :project-id="task.project_id"></project>
								<span v-if="task.project_id && task.tag_ids.length"> • </span>
								<tag v-for="tagId in task.tag_ids" :tag-id="tagId"></tag>
							</div>
						</td>
						<td>
							{{ dateToDay(task.at) }}
						</td>
						<td>
							{{secondsToString(task.seconds)}}
						</td>
					</tr>

				</tbody>

			</table>
			<h3>Total selected time: {{secondsToString(selectedTime)}}</h3>
			<ul>
				<li v-for="tag in selectedTags">
					<button @click="removeTag(tag.tag)">
						<tag :tag-id="tag.tag.id"></tag> ({{tag.tasksWithTag}}/{{selectedTasks.length}})
					</button>
				</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts" setup>
import {computed, ref} from "vue";
import {useTogglStore} from "../stores/Toggl";
import DateSelector from "./DateSelector.vue";
import {useTaskStore} from "../stores/Tasks";
import {DetailedReport, DetailedReportWithTimeEntry, Project as ProjectAPI, Tag as TagAPI} from "../TogglAPI";
import {DateTime, Duration} from "luxon";
import Tag from "./Tag.vue";
import Project from "./Project.vue";
import ProjectSelector from "./ProjectSelector.vue";
import TagSelector from "./TagSelector.vue";

const togglStore = useTogglStore();
const taskStore = useTaskStore();
const tasks = ref<SelectableReport[]>([]);
const selectedTasks = computed(() => tasks.value.filter((t) => t.selected));
const limitToProject = ref<ProjectAPI | null>(null);
const limitToTags = ref<TagAPI[]>([]);
const selectedTime = computed(() => selectedTasks.value.reduce((acc, task) => acc + task.seconds, 0));
const selectedTags = computed<SelectedTag[]>(() => {
	const tagCounter: { [tagId: string]: number } = {};
	selectedTasks.value.forEach((task) => {
		task.tag_ids.forEach((tagId) => {
			const tagIdStr = tagId.toString();
			if (!tagCounter[tagIdStr]) {
				tagCounter[tagIdStr] = 1;
			} else {
				tagCounter[tagIdStr] = tagCounter[tagIdStr] + 1;
			}
		})
	})
	return Object.keys(tagCounter).map((key) => {
		return {
			tag: togglStore.tag(parseInt(key, 10)),
			tasksWithTag: tagCounter[key]
		}
	})
})

interface SelectableReport extends DetailedReportWithTimeEntry {
	selected: boolean | undefined;
}

interface SelectedTag {
	tag: TagAPI;
	tasksWithTag: number;
}

function secondsToString(seconds: number) {
	const dur = Duration.fromMillis(seconds * 1000).normalize();
	const format = dur.as('hours') > 1 ? "h'h' m'm'" : "m'm'";
	return dur.toFormat(format);
}

function dateToDay(date: string): string {
	return DateTime.fromISO(date).toLocaleString()
}

async function getTasks() {
	const tagIds = limitToTags.value.map( (t) => t.id);
	const freshTasks = await taskStore.getTasks(limitToProject.value?.id, tagIds) as DetailedReport[];
	const timeEntries: SelectableReport[] = [];
	freshTasks.forEach( (task) => {
		task.time_entries.forEach( (entry) => {
			timeEntries.push({
				selected: false,
				...entry,
				...task,
			})
		})
	})
	tasks.value = timeEntries;
}

/** Removes [tag] from the currently selected tasks */
async function removeTag(tag: TagAPI) {
	const taskIds = selectedTasks.value.map( (t) => t.id);
	await taskStore.removeTag(taskIds, tag)
	getTasks()
}

</script>
