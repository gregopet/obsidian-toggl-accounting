import {defineStore} from "pinia";
import {ref} from "vue";
import {DateTime, Duration} from "luxon";
import {useTogglStore} from "./Toggl";
import {DetailedReport, DetailedReportQuery, RunningTimeEntry, Tag, UpdateTimeEntry} from "../TogglAPI";

export const useTimeEntriesStore = defineStore('time-entries', () => {

	/** Tags for which we would like to get our time entries (or empty array to get regardless of tag) */
	const tagIds = ref<number[]>([])

	/** Fetches all time entries */
	async function getTimeEntries(from: DateTime, to: DateTime, projectId?: number, tagIds?: number[], fromRow?: number): Promise<DetailedReport[]> {
		const togglStore = useTogglStore()
		const req: DetailedReportQuery = {
			start_date: from.toISODate(),
			end_date: to.toISODate(),
			first_row_number: fromRow,
			project_ids: projectId ? [projectId] : undefined,
			tag_ids: !tagIds || tagIds.length === 0 ? undefined : tagIds
		}
		const resp = togglStore.assertOk(await togglStore.togglRequest(
			"/reports/api/v3/workspace/{workspace_id}/search/time_entries",
			{
				method: "POST",
				body: JSON.stringify(req),
			}
		))
		if (resp.headers["x-next-row-number"]) {
			const nextReq = await getTimeEntries(from, to, projectId, tagIds, parseInt(resp.headers["x-next-row-number"]))
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

	/** Bulk add or remove tags to multiple issues */
	async function addRemoveTag(timeEntryIds: number[], tag: Tag, operation: "add" | "remove"): Promise<void> {
		const togglStore = useTogglStore();
		const req: UpdateTimeEntry = {
			tags: [tag.name],
			tag_action: operation,
		}
		togglStore.assertOk(await togglStore.togglRequest(
			`/api/v8/time_entries/${timeEntryIds.join(",")}`,
			{
				method: "PUT",
				body: JSON.stringify({ time_entry: req }),
			}
		))
	}

	/** Updates the given time entry. Tags must be given in the "tags" property, not tag IDs! */
	async function updateTask(timeEntry: RunningTimeEntry): Promise<UpdateTimeEntry> {
		const togglStore = useTogglStore();
		const body: UpdateTimeEntry = {
			description: timeEntry.description,
			start: timeEntry.start,
			stop: timeEntry.stop,
			project_id: timeEntry.project_id ?? null,
			tags: timeEntry.tags,
		}
		// TODO: tag changes!
		const method = 'PUT';
		const reply = togglStore.assertOk(await togglStore.togglRequest(
			`/api/v9/workspaces/{workspace_id}/time_entries/${timeEntry.id}`,
			{ method, body: JSON.stringify(body) }
		));
		return reply.json as UpdateTimeEntry
	}

	return { tagIds, getTimeEntries, removeTag, addTag, updateTask }
});
