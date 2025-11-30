<!--
	A control that displays a single tag (its name and tag icon). It accepts a single property:
	- tagId (Clockify's ID of the tag, it will be fetched from server automatically)
-->
<script lang="ts" setup>
import {computed} from "vue";
import {useClockifyStore} from "../stores/Clockify";

const props = defineProps<{
	tagId: string;
}>()
const tag = computed(() => useClockifyStore().tag(props.tagId))

</script>

<template>
	<span>
		<span class="cm-hashtag cm-hashtag-begin">#</span>
		<span class="cm-hashtag cm-hashtag-end">{{tag.name}}</span>
	</span>
</template>
