import {DateTime, DateTimeFormatOptions} from "luxon";

export const longDateFormatOpts: DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };

export function longDate(date: string): string {
	return DateTime.fromISO(date).toLocaleString(longDateFormatOpts)
}

export const shortDateFormatOpts: DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };

export function shortDate(date: string): string {
	return DateTime.fromISO(date).toLocaleString(shortDateFormatOpts)
}

export function shortTime(date: string): string {
	return DateTime.fromISO(date).toLocaleString({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
}
