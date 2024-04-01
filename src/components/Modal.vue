<!--
	Vue interface to Obsidian model dialogs. Takes the following properties:
	- (default slot): the content to display inside the dialog
	- title: the title to display on top of the dialog

	It emits the following events:
	- close() -> called just before Obsidian's "close" is called on the dialog, useful for performing outside logic.
	             Since the user can also close the dialog by pressing Escape or clicking outside of the dialog, it's
	             a very good idea to clean up the Vue condition that caused the dialog to open in the first place.

	It exposes the following programmatic handles:
	- close() -> does the same as if the user had clicked on the X icon or pressed Escape or clicked outside of the
	             dialog

-->
<script lang="ts" setup>
import { Modal, App } from 'obsidian';
import { h, nextTick, onBeforeMount, onMounted, ref, useSlots } from 'vue';
import { useObsidanStore } from '../stores/Obsidian';
import {getCurrentInstance, toRaw} from "vue";

const props = defineProps<{
    title: string;
	onClose?: () => any
}>();

const obsidian = useObsidanStore();
const mountPoint = ref<null | HTMLElement>(null);

class SettingsModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen(): void {
        mountPoint.value = this.modalEl.querySelector('.modal-content');
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
