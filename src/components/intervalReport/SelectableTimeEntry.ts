import {DetailedReport, TimeEntry} from "../../TogglAPI";

/** A time entry that can be selected or unselected */
interface SelectableTimeEntry extends TimeEntry {
	selected: boolean | undefined;
}

/** Transform downloaded reports into UI classes */
export function createSelectableTimeEntries(reports: DetailedReport[]): SelectableTimeEntry[] {
	const newTimeEntries: SelectableTimeEntry[] = [];
	reports.forEach( (entry) => {
		entry.time_entries.forEach( (temporal) => {
			newTimeEntries.push({
				selected: false,
				...temporal,
				...entry,
			})
		})
	})
	return newTimeEntries;
}

export default SelectableTimeEntry;
