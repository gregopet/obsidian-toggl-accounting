import {defineStore} from "pinia";
import {nextTick, ref} from "vue";
import {DateTime} from "luxon";
import {TimeEntryWithRatesDtoV1, useClockifyStore} from "./Clockify";


export const useCurrentStore = defineStore('current', () => {

	/** The currently active time tracking entries*/
	const current = ref<TimeEntryWithRatesDtoV1[]>([])

	/** Gets the current time entry or null if there are no time entries and update the state */
	async function refreshCurrent()  {
		const clockifyStore = useClockifyStore();
		if (clockifyStore.loginState == "OK") {
			const { data, error } = await clockifyStore.client.GET("/v1/workspaces/{workspaceId}/user/{userId}/time-entries", {
				params: {
					path: { workspaceId: clockifyStore.user!.defaultWorkspace!, userId: clockifyStore.user?.id! },
					query: { "in-progress": true }
				},
				headers: { ...clockifyStore.authHeaders() }
			})
			await nextTick(() => {
				current.value = data || [];
			})
		} else {
			await nextTick(() => {
				current.value = [];
			});
		}
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

	return {
		current, refreshCurrent, startCurrent, stopCurrent
	}

})
