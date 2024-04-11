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
				"time_entry": {
					description, pid: projectId, tags, created_with
				}
			});
			const contentType = "application/json";
			const resp = togglStore.assertOk(await togglStore.togglRequest("/api/v8/time_entries/start", { method: 'POST', body, contentType }))
			if (resp.status < 300) {
				await nextTick(() => {
					current.value = fixNonStandardReply(resp.json.data);
				});
			}
		}
	}

	/** Response from creating a time entry does not have the same structure as when fetching the response, so we standardize it */
	function fixNonStandardReply(payload: any): any {
		const responseBody = { ... payload } // json.data is immutable
		if (!responseBody.project_id) {
			responseBody.project_id = responseBody.pid;
		}
		if (!responseBody.tag_ids && responseBody.tags) {
			responseBody.tag_ids = useTogglStore().tags
				.filter( (t) =>
					responseBody.tags && responseBody.tags!.findIndex((tName: string) => t.name == tName) >= 0
				)
				.map((t) => t.id)
		}
		return responseBody;
	}

	/** Stops the running time entry */
	async function stopCurrent() {
		if (current.value) {
			const togglStore = useTogglStore();
			if (togglStore.loginState == "OK") {
				const method = 'PUT';
				const resp = togglStore.assertOk(await togglStore.togglRequest(`/api/v8/time_entries/${current.value.id}/stop`, { method }))
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
