<template>
	<div>
		From {{ timeEntriesStore.from }} to {{ timeEntriesStore.to }}
	</div>
</template>

<script lang="ts" setup>
import {useTimeEntriesStore} from "../stores/TimeEntries";

const timeEntriesStore = useTimeEntriesStore()
</script>
