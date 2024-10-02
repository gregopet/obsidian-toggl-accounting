<!--
	A control that displays a single tag (its name and tag icon). It accepts a single property:
	- tagId (Toggl's ID of the tag, it will be fetched from server automatically)
-->
<script lang="ts" setup>
import {useTogglStore} from "../stores/Toggl";
import {computed} from "vue";

const props = defineProps<{
	tagId: number;
}>()
const tag = computed(() => useTogglStore().tag(props.tagId))
</script>

<template>
	<span>
		<span class="cm-hashtag cm-hashtag-begin">#</span>
		<span class="cm-hashtag cm-hashtag-end">{{tag.name}}</span>
	</span>
</template>
