import {defineStore} from "pinia";
import {ref} from "vue";
import {DateTime, Duration} from "luxon";
import {useTogglStore} from "./Toggl";
import {DetailedReport, DetailedReportQuery, Tag, UpdateTimeEntry} from "../TogglAPI";

export const useTimeEntriesStore = defineStore('time-entries', () => {

	/** Day from which time entries will be shown */
	const from = ref(DateTime.now().minus(Duration.fromISO("P2M")))

	/** Day up to which time entries will be shown */
	const to = ref(DateTime.now().plus(Duration.fromISO("P2D")))

	/** Tags for which we would like to get our time entries (or empty array to get regardless of tag) */
	const tagIds = ref<number[]>([])

	/** Fetches all time entries */
	async function getTimeEntries(projectId?: number, tagIds?: number[], fromRow?: number): Promise<DetailedReport[]> {
		const togglStore = useTogglStore()
		const req: DetailedReportQuery = {
			start_date: from.value.toISODate(),
			end_date: to.value.toISODate(),
			first_row_number: fromRow,
			project_ids: projectId ? [projectId] : undefined,
			tag_ids: !tagIds || tagIds.length === 0 ? undefined : tagIds
		}
		console.log(tagIds, req)
		const resp = togglStore.assertOk(await togglStore.togglRequest(
			"/reports/api/v3/workspace/{workspace_id}/search/time_entries",
			{
				method: "POST",
				body: JSON.stringify(req),
			}
		))
		if (resp.headers["x-next-row-number"]) {
			const nextReq = await getTimeEntries(projectId, tagIds, parseInt(resp.headers["x-next-row-number"]))
			return (resp.json as DetailedReport[]).concat(nextReq);
		} else {
			return resp.json
		}
	}

	/** Removes the given tag from the time entries */
	async function removeTag(timeEntryIds: number[], tag: Tag): Promise<void> {
		return addRemoveTag(timeEntryIds, tag, "remove")
	}

	/** Adds the given tag from the time entries */
	async function addTag(timeEntryIds: number[], tag: Tag): Promise<void> {
		return addRemoveTag(timeEntryIds, tag, "add")
	}

	async function addRemoveTag(timeEntryIds: number[], tag: Tag, operation: "add" | "remove"): Promise<void> {
		const togglStore = useTogglStore();
		const req: UpdateTimeEntry = {
			tags: [tag.name],
			tag_action: operation,
		}
		console.log(JSON.stringify(req))
		togglStore.assertOk(await togglStore.togglRequest(
			`/api/v8/time_entries/${timeEntryIds.join(",")}`,
			{
				method: "PUT",
				body: JSON.stringify({ time_entry: req }),
			}
		))
	}

	return { from, to, tagIds, getTimeEntries, removeTag, addTag }
});
