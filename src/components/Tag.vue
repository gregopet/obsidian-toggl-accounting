<template>
	<span class="tag">
		<svg width="13" height="13" viewBox="0 0 17 17"><path d="M0 6.002c0 1.103.633 2.63 1.416 3.414l6.168 6.168a1.996 1.996 0 002.828.004l5.176-5.176c.78-.78.78-2.045-.004-2.828L9.416 1.416C8.634.634 7.113 0 6.002 0H1.998A1.993 1.993 0 000 1.998v4.004zM4 6a2 2 0 100-4 2 2 0 000 4z" fill="#95899B" fill-rule="evenodd"></path></svg>
		<span class="name">{{ tag.name }}</span>
	</span>
</template>

<script lang="ts" setup>
import {useTogglStore} from "../stores/Toggl";
import {computed} from "vue";

const props = defineProps<{
	tagId: number;
}>()
const tag = computed(() => useTogglStore().tag(props.tagId))
</script>

<style scoped>
	span.tag {
		display: inline-flex;
		align-items: center;
	}
	span.name {
		margin-left: 0.25em;
	}
</style>
