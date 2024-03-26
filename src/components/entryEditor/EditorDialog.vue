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
