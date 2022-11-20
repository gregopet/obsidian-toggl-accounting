import {Duration} from "luxon";

/** Transforms the number of seconds into a string like 3h 20m. The hour part is not printed if 0. */
export function secondsToString(seconds: number) {
	const dur = Duration.fromMillis(seconds * 1000).normalize();
	const format = dur.as('hours') > 1 ? "h'h' m'm'" : "m'm'";
	return dur.toFormat(format);
}
