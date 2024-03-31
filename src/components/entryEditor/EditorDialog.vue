<!--
	A modal dialog via which entries can be modified: their name, tags, project and start/end times can all be
	manipulated. Currently running tasks will close automatically if their end time is set.

	This dialog is still a work in progress.
-->
<script lang="ts" setup>
import Modal from "../Modal.vue";

const props = defineProps<{
    onClose: () => any
}>();
</script>

<template>
    <modal @close="props.onClose" title="Well here we are for lolz">
        <div>LOLZ!</div>
    </modal>
</template>
