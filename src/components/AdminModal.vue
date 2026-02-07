<template>
  <div v-if="open" class="modal fade show d-block" tabindex="-1" @click.self="emit('close')">
    <div :class="['modal-dialog', 'modal-dialog-centered', sizeClass]">
      <div class="modal-content bg-secondary text-white">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close btn-close-white" @click="emit('close')"></button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close']);

const sizeClass = computed(() => (props.size ? `modal-${props.size}` : ''));
</script>

<style scoped>
.modal.show.d-block {
  background-color: rgba(0, 0, 0, 0.5);
}
.btn-close-white {
  filter: invert(1) grayscale(100%) brightness(200%);
}
</style>
