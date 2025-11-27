import {DetailedReport, TimeEntry} from "../../TogglAPI";
import {TimeEntryWithRatesDtoV1} from "../../stores/Clockify";

/** A time entry that can be selected or unselected */
interface SelectableTimeEntry extends TimeEntryWithRatesDtoV1 {
	selected: boolean | undefined;
}

/** Transform downloaded reports into UI classes */
export function createSelectableTimeEntries(reports: TimeEntryWithRatesDtoV1[]): SelectableTimeEntry[] {
	return reports as SelectableTimeEntry[];
}

export default SelectableTimeEntry;
