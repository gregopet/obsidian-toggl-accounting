<script lang="ts" setup>

/*
 * A simple from/to date picker with presets. 
 * Warning: this preset will change on date boundaries, this could cause a task refresh if bound directly!
 */
import {DateTime, DateTimeUnit} from "luxon";
import {computed } from "vue";
import {ref} from "vue";
import { useIntervalFn }  from "@vueuse/core";
import { ftruncate } from "fs";

/**
 * Helpers for v-bind
 * If from and/or to dates are undefined, the input will trigger immediate change events.
 */
const emit = defineEmits(["update:dateFrom", "update:dateTo"]);

const presets = ["this-year", "this-month", "this-week", "this-day", "last-year", "last-month", "last-day"] as const;
type DatePreset = typeof presets[number] | "custom";

const props = defineProps<{
	dateFrom?: DateTime,
	dateTo?: DateTime,
}>()

/** Force the 'custom' preset, regardless of dates? Set when customer chooses the 'custom' preset
  * from the dropdown, cancelling automatic date adjustments (where we try to adjust the dates so
  * the preset setting is still valid).
  */
const forceCustom = ref(false)

/** Make sure the interface stays up to date even when interface is open for a long time and dates change */
const updater = useIntervalFn(() => {checkPreset()}, 20000)


/** Returns the current date & time, can be changed for testing */
function now(): DateTime {
	return DateTime.now();
}

function sameDayOrBothFalsy(d1?: DateTime, d2?: DateTime): boolean {
	if (!d1 && !d2) return true;
	return d1?.toISODate() === d2?.toISODate();
}

const preset = computed<DatePreset>(() => {
	// Set the preset based on the given dates
	const forcedCustom = forceCustom.value ? 'custom' : undefined;
	return forcedCustom || presets.find((p) => {
		const [dateFrom, dateTo] = presetToDates(p)
		return sameDayOrBothFalsy(dateFrom, props.dateFrom) && sameDayOrBothFalsy(dateTo, props.dateTo);
	}) || "custom"
})

/** Update just one of the dates when user is in 'custom' mode */
function emitNonNull(event: Event, name: "update:dateFrom" | "update:dateTo") {
	const value = (event.target as HTMLInputElement).value
	if (value != null) {
		emit(name, DateTime.fromISO(value))
	}
}

/** When user changes the preset, see if dates need changing */
function changePreset(event: Event) {
	const preset = (event.target as HTMLSelectElement).value as DatePreset;
	forceCustom.value = preset === 'custom';
	if (!forceCustom.value) {
		const [dateFrom, dateTo] = presetToDates(preset);
		emit("update:dateFrom", dateFrom)
		emit("update:dateTo", dateTo)
	}
}

/** Checks if the preset is still valid - if not, it updates the dates so they still match the preset! */
function checkPreset() {
	if (preset.value != "custom") {
		const [dateFrom, dateTo] = presetToDates(preset.value);
		if (!sameDayOrBothFalsy(dateFrom, props.dateFrom)) {
			emit("update:dateFrom", dateFrom);
		}
		if (!sameDayOrBothFalsy(dateTo, props.dateTo)) {
			emit("update:dateTo", dateTo);
		}
	}
}

/** 
 * Takes a preset and calculates a from/to based on current date.
 * @param preset A string matching the DateTimeUnit type, prefixed by either 'this-' or 'last-', e.g. 'this-day' or 'last-month'
 * @returns A pair of start & end DateTime instances, e.g. [2023-01-01, 2023-01-31]
 */
function presetToDates(preset: DatePreset): [DateTime, DateTime] {
	const dateUnit = preset.substring(preset.indexOf("-") + 1) as DateTimeUnit;
	let start = now().startOf(dateUnit)
	if (preset.indexOf("last") == 0) {
		start = start.minus({hour: 12}).startOf(dateUnit)
	}
	return [start, start.endOf(dateUnit)]
}
</script>

<template>
	<select :value="preset" @change="changePreset($event)">
		<option value="custom">Custom</option>
		<option value="this-day">Today</option>
		<option value="last-day">Yesterday</option>
		<option value="this-week">This week</option>
		<option value="last-week">Last week</option>
		<option value="this-month">This month</option>
		<option value="last-month">Last month</option>
	</select>

	<div v-if="preset == 'custom'">
		From <input type="date" :value="dateFrom ? dateFrom.toISODate() : undefined" @change="emitNonNull($event, 'update:dateFrom')"  required>
		to <input type="date" :value="dateTo ? dateTo.toISODate() : null" @change="emitNonNull($event, 'update:dateTo')" required>
	</div>
</template>
