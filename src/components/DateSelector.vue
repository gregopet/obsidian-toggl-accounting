<template>
	<div>
		From {{ taskStore.from }} to {{ taskStore.to }}
	</div>
</template>

<script lang="ts" setup>
import {useTaskStore} from "../stores/Tasks";

const taskStore = useTaskStore()
</script>
