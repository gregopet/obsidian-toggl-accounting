import {defineStore} from "pinia";
import {useTogglStore} from "./Toggl";
import {RunningTimeEntry} from "../TogglAPI";
import {ref} from "vue";

export const useCurrentStore = defineStore('current', () => {

	/** The currently active time tracking entry, if any */
	const current = ref<RunningTimeEntry | null>(null)

	/** Gets the current time entry or null if there are no time entries and update the state */
	async function refreshCurrent()  {
		const togglStore = useTogglStore();
		if (togglStore.loginState == "OK") {
			const timeEntry = togglStore.assertOk(await togglStore.togglRequest("/api/v9/me/time_entries/current"));
			current.value = timeEntry.json;
		} else {
			current.value = null;
		}
	}

	return {
		current, refreshCurrent
	}

})
