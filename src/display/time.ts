import {DateTime} from "luxon";

export function longDate(date: string): string {
	return DateTime.fromISO(date).toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' })
}

export function shortTime(date: string): string {
	return DateTime.fromISO(date).toLocaleString({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
}
