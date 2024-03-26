/** A dialog for an editor that allows us to change the current task's properties */
<script lang="ts" setup>
import { Modal, App } from 'obsidian';
import { h, nextTick, onBeforeMount, onMounted, ref, useSlots } from 'vue';
import { useObsidanStore } from '../stores/Obsidian';
import {getCurrentInstance, toRaw} from "vue";

const obsidian = useObsidanStore();
const mountPoint = ref<null | HTMLElement>(null);

const props = defineProps<{
    title: string;
	onClose?: () => any
}>();

class SettingsModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen(): void {
        mountPoint.value = this.modalEl;
        this.titleEl.setText(props.title);
    }

    close(): void {
        // Do not close this dialog until Vue has cleaned itself up!
        if (props.onClose) props.onClose();
        nextTick(() => {
            super.close();
        });
    }
}

/** Open the dialog before mounting this control */
let control: SettingsModal | null = null;
onBeforeMount(() => {
	control = new SettingsModal(toRaw(obsidian.app) as App);
	control.open();
});
function close() {
	if (control) control.close();
}

/** Allow programatic closing of this modal */
defineExpose({
	close
})

</script>


<template>
    <Teleport :to="mountPoint">
        <slot></slot>
    </Teleport>
</template>
