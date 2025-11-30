import {defineStore} from "pinia";
import {nextTick, ref} from "vue";
import {DateTime, Duration} from "luxon";
import {useTogglStore} from "./Toggl";
import {DetailedReport, DetailedReportQuery, RunningTimeEntry, Tag, UpdateTimeEntry} from "../TogglAPI";
import {TimeEntryWithRatesDtoV1, useClockifyStore} from "./Clockify";
import {components} from "../Clockify";

export const useTimeEntriesStore = defineStore('time-entries', () => {

	/** Tags for which we would like to get our time entries (or empty array to get regardless of tag) */
	const tagIds = ref<number[]>([])

	/** The currently active time tracking entries*/
	const current = ref<TimeEntryWithRatesDtoV1[]>([])

	/** Recent tasks */
	const recentTasks = ref<TimeEntryWithRatesDtoV1[]>([])

	/** Gets the current time entry or null if there are no time entries and update the state */
	async function refreshCurrent()  {
		const clockifyStore = useClockifyStore();
		if (clockifyStore.loginState == "OK") {
			const { data, error } = await clockifyStore.client.GET("/v1/workspaces/{workspaceId}/user/{userId}/time-entries", {
				params: {
					path: { workspaceId: clockifyStore.user!.defaultWorkspace!, userId: clockifyStore.user?.id! },
				},
				headers: { ...clockifyStore.authHeaders() }
			})

			if (error) throw error;

			await nextTick(() => {
				recentTasks.value = data
				// any ongoing time entries?
				current.value = data.filter(d => !d.timeInterval!.end);
			})
		} else {
			await nextTick(() => {
				recentTasks.value = []
				current.value = [];
			});
		}
	}

	/** Fetches all time entries */
	async function getTimeEntries(from: DateTime, to: DateTime, projectId?: string, tagIds?: string[]): Promise<TimeEntryWithRatesDtoV1[]> {
		const clockifyStore = useClockifyStore()
		const { data } = await clockifyStore.client.GET("/v1/workspaces/{workspaceId}/user/{userId}/time-entries", {
			params: {
				path: { workspaceId: clockifyStore.user!.defaultWorkspace!, userId: clockifyStore.user?.id! },
				query: {
					tags: tagIds,
					project: projectId,
					// FIXME: times seem to be off by 1 hour? .. even though we are sending UTC and they are sending UTC...
					start: from.toUTC().toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
					end: to.toUTC().toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
				}
			},
			headers: { ...clockifyStore.authHeaders() }
		});
		return data!;
	}

	/** Removes the given tag from the time entries */
	async function removeTag(timeEntryIds: TimeEntryWithRatesDtoV1[], tag: components["schemas"]["TagDtoV1"]): Promise<void> {
		await addRemoveTag(timeEntryIds, tag, "remove")
	}

	/** Adds the given tag from the time entries */
	async function addTag(timeEntryIds: TimeEntryWithRatesDtoV1[], tag: components["schemas"]["TagDtoV1"]): Promise<void> {
		await addRemoveTag(timeEntryIds, tag, "add")
	}

	/**
	 * Bulk add or remove tags to multiple issues; updates the given issues in place!
	 * Updates the first parameter in place
	 * https://engineering.toggl.com/docs/api/time_entry/index.html#patch-bulk-editing-time-entries
	 * */
	async function addRemoveTag(timeEntries: TimeEntryWithRatesDtoV1[], tag: components["schemas"]["TagDtoV1"], op: "add" | "remove"): Promise<void> {
		const entriesToSend = timeEntries
			.filter(e=> {
				const hasTag = e.tagIds?.contains(tag.id!);
				return !hasTag && op === "add" || hasTag && op === "remove"
			})
			.map(e => {
				let tagIds = [ ...e.tagIds! ]
				if (op === "add") {
					tagIds.push(tag.id!)
				}
				else if (op == "remove") {
					tagIds = tagIds.filter( tid => tid != tag.id)
				}
				const cmd: components["schemas"]["UpdateTimeEntryBulkRequest"] = {
					id: e.id!,
					tagIds,
					description: e.description,
					start: e.timeInterval!.start,
					end: e.timeInterval!.end,
					projectId: e.projectId,
					billable: e.billable
				}
				return cmd
			})

		const clockifyStore = useClockifyStore()
		const { data, error } = await clockifyStore.client.PUT("/v1/workspaces/{workspaceId}/user/{userId}/time-entries", {
			headers: { ...clockifyStore.authHeaders() },
			params: {
				path: {workspaceId: clockifyStore.user!.defaultWorkspace!, userId: clockifyStore.user?.id!},
			},
			body: entriesToSend
		})
		if (error) {
			throw error;
		} else {
			data!.forEach((upd) => {
				const match = timeEntries.find(entr => entr.id === upd.id)
				if (match) {
					Object.assign(upd, match)
				}
			})
		}
	}

	/** Updates the given time entry. */
	async function updateTask(id: string, workspaceId: string, changeRequest: components["schemas"]["UpdateTimeEntryRequest"]): Promise<TimeEntryWithRatesDtoV1> {
		const clockifyStore = useClockifyStore();

		const { data, error } = await clockifyStore.client.PUT("/v1/workspaces/{workspaceId}/time-entries/{id}", {
			body: changeRequest,
			params: {
				path: { id, workspaceId },
			},
			headers: { ...clockifyStore.authHeaders() },
		})
		if (error) {
			throw error;
		} else {
			return data;
		}
	}

	/** Delete the time entry with the given ID */
	async function deleteEntry(timeEntryId: string): Promise<void> {
		const method = "DELETE";
		const clockifyStore = useClockifyStore();

		const { data, error } = await clockifyStore.client.DELETE("/v1/workspaces/{workspaceId}/time-entries/{id}", {
			headers: { ...clockifyStore.authHeaders() },
			params: {
				path: {
					workspaceId: clockifyStore.user!.defaultWorkspace!,
					id: timeEntryId
				}
			}
		})
		if (error) throw(error);
	}

	/** Starts a new time entry */
	async function startCurrent(description: string, tags: string[], projectId: string | undefined) {
		const clockifyStore = useClockifyStore();
		if (clockifyStore.loginState == "OK") {
			const { data, error } = await clockifyStore.client.POST("/v1/workspaces/{workspaceId}/time-entries", {
				params: {
					path: { workspaceId: clockifyStore.user!.defaultWorkspace! },
				},
				headers: { ...clockifyStore.authHeaders() },
				body: {
					start: DateTime.now().toISO(),
					tagIds: tags,
					description,
					projectId
				}
			})
			if (data) {
				await nextTick(() => {
					current.value = [data as TimeEntryWithRatesDtoV1]; // it's really components["schemas"]["TimeEntryDtoImplV1"] but they are almost the same
				});
			} else {
				throw error;
			}
		}
	}

	/** Stops the running time entry */
	async function stopCurrent() {
		if (current.value) {
			const clockifyStore = useClockifyStore();
			const {data, error} = await clockifyStore.client.PATCH("/v1/workspaces/{workspaceId}/user/{userId}/time-entries", {
				params: {
					path: { workspaceId: clockifyStore.user!.defaultWorkspace!, userId: clockifyStore.user?.id! }
				},
				headers: { ...clockifyStore.authHeaders() },
				body: {
					end: new Date().toISOString()
				}
			})
			if (!error) {
				current.value = []
			}
		}
	}

	return { tagIds, getTimeEntries, removeTag, addTag, updateTask, deleteEntry, startCurrent, stopCurrent, refreshCurrent, current, recentTasks }
});
