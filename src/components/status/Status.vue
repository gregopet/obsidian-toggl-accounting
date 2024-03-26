<template>
	<div class="entry-and-button">
		<div class="entry">
			<no-timer v-if="!status.current"></no-timer>
			<running-timer v-else :timer="status.current"></running-timer>
		</div>
		<div class="button" @click="status.current ? stop() : startNewIsOpen = true">
			<div v-if="!status.current" class="play"></div>
			<div v-else class="stop"></div>
		</div>
		<start-new-dialog v-if="startNewIsOpen" @close="startNewIsOpen = false" />
	</div>
</template>

<script lang="ts" setup>
import {useCurrentStore} from "../../stores/Current";
import NoTimer from "./NoTimer.vue";
import RunningTimer from "./RunningTimer.vue";
import {ref} from "vue";
import StartNewDialog from "./StartNewDialog.vue";

const status = useCurrentStore()
const startNewIsOpen = ref(false);

/** Stop the running timer */
function stop() {
	status.stopCurrent();
}


</script>

<style scoped>

	* {
		--circular-border-width: 2px;
	}

	.entry-and-button {
		display: flex;
		justify-content: space-between;

	}

	.entry-and-button .button {
		width: 2.5em;
		height: 2.5em;
		border-radius: 2.5em;
		border: var(--circular-border-width) solid var(--text-normal);
		flex-shrink: 0;

		display: flex;
		justify-content: center;
		align-items: center;
	}
	.entry-and-button .button:hover {
		background-color: var(--text-normal);
	}

	.play {
		position: relative;
		left: 1px;


		--button-height: 0.5rem;
		margin-left: calc(2 * 0.14 * var(--button-height));
		width: 0;
		height: 0;
		border: none;
		border-top: var(--button-height) solid transparent;
		border-bottom: var(--button-height) solid transparent;
		border-left: calc(var(--button-height) * 2 * 0.86) solid var(--text-normal);
	}

	.entry-and-button .button:hover .play {
		border-left-color: var(--background-primary);
		background-color: var(--text-normal);
	}


	.stop {
		position: relative;;
		width: 1em;
		height: 1em;
		padding-top: calc(var(--circular-border-width) / 2);
		padding-left: calc(var(--circular-border-width) / 2);
		background-color: var(--text-normal);
	}


</style>
