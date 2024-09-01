import {defineStore} from "pinia";
import {useTogglStore} from "./Toggl";
import {RunningTimeEntry} from "../TogglAPI";
import {nextTick, ref} from "vue";
import {DateTime} from "luxon";

export const useCurrentStore = defineStore('current', () => {

	/** The currently active time tracking entry, if any */
	const current = ref<RunningTimeEntry | null>(null)

	/** Gets the current time entry or null if there are no time entries and update the state */
	async function refreshCurrent()  {
		const togglStore = useTogglStore();
		if (togglStore.loginState == "OK") {
			const timeEntry = togglStore.assertOk(await togglStore.togglRequest("/api/v9/me/time_entries/current"));
			await nextTick(() => {
				current.value = timeEntry.json;
			})
		} else {
			await nextTick(() => {
				current.value = null;
			});
		}
	}

	/** Starts a new time entry */
	async function startCurrent(description: string, tags: string[], projectId: number | undefined) {
		const togglStore = useTogglStore();
		if (togglStore.loginState == "OK") {
			const created_with = "obsidian-toggl-accounting";
			const body = JSON.stringify({
				description, pid: projectId, tags, created_with, duration: -1654686174, wid: useTogglStore().workspaceId, end: null, start: DateTime.now().toString()
			});
			const contentType = "application/json";
			const resp = togglStore.assertOk(await togglStore.togglRequest("/api/v9/time_entries", { method: 'POST', body, contentType }))
			if (resp.status < 300) {
				await nextTick(() => {
					current.value = resp.json;
				});
			}
		}
	}

	/** Stops the running time entry */
	async function stopCurrent() {
		if (current.value) {
			const togglStore = useTogglStore();
			if (togglStore.loginState == "OK") {
				const method = 'PATCH';
				const resp = togglStore.assertOk(await togglStore.togglRequest(`/api/v9/workspaces/{workspace_id}/time_entries/${current.value.id}/stop`, { method }))
				if (resp.status < 300) {
					await nextTick(() => {
						current.value = null;
					});
				}
			}
		}
	}

	return {
		current, refreshCurrent, startCurrent, stopCurrent
	}

})
