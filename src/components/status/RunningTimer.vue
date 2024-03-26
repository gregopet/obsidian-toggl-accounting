<template>
	Running timer {{timer.timer.description}} (since {{formatTime(timer.timer.start ?? '')}})
</template>
<script lang="ts" setup>
import {RunningTimeEntry} from "../../TogglAPI";
import {shortTime} from "../../display/time";
import {useCurrentStore} from "../../stores/Current";
const formatTime = shortTime
const currentStore = useCurrentStore();

const timer = defineProps<{
	timer: RunningTimeEntry
}>()
</script>
