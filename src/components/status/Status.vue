<!--
	A parent control that will, if a time entry is being tracked, display the <running-timer> child control. In order
	for the user to be able to click on as wide area as possible, the click logic <running-timer> for both controls is
	triggered from here, and for this reason the control also renders the <start-new-dialog> child control (via which
	one can choose to start tracking a new time entry).

	It will also display a loader so users know when their request is still ongoing (as the Toggl API is sometimes slow
	and further calls are blocked).
-->
<script lang="ts" setup>
import {useCurrentStore} from "../../stores/Current";
import RunningTimer from "./RunningTimer.vue";
import {computed, ref} from "vue";
import StartNewDialog from "./StartNewDialog.vue";
import {mapState, storeToRefs} from "pinia";
import {useTogglStore} from "../../stores/Toggl";

const { current } = storeToRefs(useCurrentStore())
const startNewIsOpen = ref(false);
const timerIsRunning = computed(() => current.value && !current.value.stop)
const isRequestInFlight = mapState(useTogglStore, ['requestInFlight']);

/** Stop the running timer */
function stop() {
	useCurrentStore().stopCurrent();
}
</script>

<template>
	<div class="loader" v-show="isRequestInFlight.requestInFlight()"></div>
	<div class="entry-and-button">
		<div class="entry">
			<span v-if="!timerIsRunning">No timer is currently running</span>
			<running-timer v-else :timer="current!"></running-timer>
		</div>
		<div class="button" @click="current ? stop() : startNewIsOpen = true">
			<div v-if="!timerIsRunning" class="play"></div>
			<div v-else class="stop"></div>
		</div>
		<start-new-dialog v-if="startNewIsOpen" @close="startNewIsOpen = false" />
	</div>
</template>

<style scoped>

	* {
		--circular-border-width: 2px;
	}

	.entry-and-button {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--size-4-4); /** We've overriden this in Obsidian */
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

	.entry-and-button .button:hover .stop {
		border-color: var(--background-primary);
		background-color: var(--background-primary);
	}

	/* https://css-loaders.com/ */
	.loader {
		width: 100%;
		height: 2px;
		color: var(--background-secondary);
		background:
			radial-gradient(circle 10px at right 7px top 50%,var(--text-normal) 92%,currentColor),
			radial-gradient(circle 10px at right 0   top 50%,currentColor 92%,var(--text-normal));
		background-size: calc(100%/3) 100%;
		background-position: 50% 0%;
		animation: l5 .5s infinite linear;
	}
	@keyframes l5 {
		100% {background-position: 0% 0%}
	}

</style>
