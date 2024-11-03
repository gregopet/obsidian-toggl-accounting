<!--
Take a text block and replace any ticket slug with a link to the issue tracker (issue slugs are
configured in settings).

Currently only works on simple text blocks! Slugs cannot yet belong to individual projects!
-->

<script lang="ts" setup>
import {ref, Text, useSlots} from "vue";
import {useObsidanStore} from "../stores/Obsidian";

const slots = useSlots()!;
const textNodes = slots.default!()
if (textNodes?.length > 1) {
	throw "More than 1 node is currently not supported in issue-linker-tracker";
}
if (textNodes[0].type != Text) {
	throw "Only pure text nodes are currently supported in issue-link-tracker"
}
let txt = textNodes[0].children as string // this actually results in a string for some reason

const config = useObsidanStore().settings;
console.debug("Trying to replace based on ", config?.trackerLinks)
for (let link of (config?.trackerLinks ?? [])) {
	try {
		var regexp = new RegExp(link.regexp, "g");
		txt = txt.replace(regexp, `<a href="${link.replacement}">$&</a>`)
	} catch(err) {
		console.warn("Error replacing tracker link", err)
	}
}
const contentWithLinks = ref(txt)
</script>


<template>
	<span v-html="contentWithLinks"></span>
</template>
