<script lang="ts" setup>

	import {storeToRefs} from "pinia";
	import {useCurrentStore} from "../../stores/Current";
	import {shortDate, shortTime} from "../../display/time";
	import Tag from "../Tag.vue";
	import {computed, nextTick, ref} from "vue";
    import {useClockifyStore} from "../../stores/Clockify";
    import {RunningTimeEntry} from "../../ClockifyAPI";
	import EditorDialog from "../entryEditor/EditorDialog.vue";

	const { recentTasks } = storeToRefs(useCurrentStore())
	const formatDate = shortDate;
	const formatTime = shortTime;

	/** The time entry we are editing */
	const editedTimeEntry = ref<RunningTimeEntry | undefined>(undefined);

	function editor(entry: RunningTimeEntry) {
		editedTimeEntry.value = entry;
	}

	function closeEditor() {
		console.log(editedTimeEntry.value);
		editedTimeEntry.value = undefined;
		nextTick(() => {})
	}

	/** An entry was deleted using the editor dialog */
    function deleted(entryId: string) {
		var index = recentTasks.value!.findIndex(entry => entry.id === entryId);
		if (index >= 0) {
			recentTasks.value!.splice(index, 1);
		}
	}

    function projectColor(task: RunningTimeEntry) {
        if (!task.projectId) return "var(--color-base-05)";
        let proj = useClockifyStore().project(task.projectId);
		if (proj) return proj.color;
		else return "var(--color-base-05)";
	}
</script>

<template>
	<div>
		<ul>
			<li v-for="task in recentTasks" :style="{ borderLeftColor: projectColor(task)}" @click.right="editor(task)">
				<div class="floating-tags">
					{{task.description}}

					<span class="tags">
                        <tag :tag-id="tagId" v-for="tagId in (task.tagIds || [])" />
					</span>
				</div>
				<div class="twosides">
					<span>
                        {{ formatDate(task.start || '') }}
					</span>

					<span>
                        {{ formatTime(task.start || '') }} -
                        <span v-if="task.end">{{ formatTime(task.end) }}</span>
						<span v-else>(running)</span>
					</span>
				</div>
			</li>
		</ul>
		<editor-dialog v-if="editedTimeEntry" @close="closeEditor()" v-model="editedTimeEntry" @deleted="deleted" />
	</div>
</template>

<style scoped>
	ul {
		list-style: none;
		padding: 0;
	}
	li {
		padding: 0.5em;
		margin: 0.5em 0.1em;
		background-color: var(--color-base-05);
		border-radius: var(--radius-m);
		border-left-width: 0.2em;
		border-left-style: solid;
		/* Border color will be provided by code, depending on the project */
	}

	.twosides {
		display: flex;
		justify-content: space-between;
	}

	.floating-tags .tags {
		display: inline-block;
		white-space: nowrap;
		float: right;
		text-align: right;
	}
</style>
