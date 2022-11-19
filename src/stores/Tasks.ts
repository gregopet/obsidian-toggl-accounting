import {defineStore} from "pinia";
import {ref} from "vue";
import {DateTime, Duration} from "luxon";
import {useTogglStore} from "./Toggl";
import {DetailedReport, DetailedReportQuery, Tag, UpdateTimeEntry} from "../TogglAPI";

export const useTaskStore = defineStore('tasks', () => {

	/** Day from which tasks will be shown */
	const from = ref(DateTime.now().minus(Duration.fromISO("P2M")))

	/** Day up to which tasks will be shown */
	const to = ref(DateTime.now().plus(Duration.fromISO("P2D")))

	/** Tags for which we would like to get our tasks (or empty array to get regardless of tag) */
	const tagIds = ref<number[]>([])

	/** Fetches all tasks */
	async function getTasks(projectId?: number, tagIds?: number[], fromRow?: number): Promise<DetailedReport[]> {
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
			const nextReq = await getTasks(projectId, tagIds, parseInt(resp.headers["x-next-row-number"]))
			return (resp.json as DetailedReport[]).concat(nextReq);
		} else {
			return resp.json
		}
	}

	/** Removes the given tag from the time entry */
	async function removeTag(timeEntryId: number[], tag: Tag): Promise<void> {
		// TODO: refresh task before saving it in case it was changed on the server in the meantime

		const togglStore = useTogglStore();
		const req: UpdateTimeEntry = {
			tags: [tag.name],
			tag_action: "remove",
		}
		console.log(JSON.stringify(req))
		togglStore.assertOk(await togglStore.togglRequest(
			`/api/v8/time_entries/${timeEntryId.join(",")}`,
			{
				method: "PUT",
				body: JSON.stringify({ time_entry: req }),
			}
		))
	}

	return { from, to, tagIds, getTasks, removeTag }
});
