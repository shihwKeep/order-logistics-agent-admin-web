<script setup lang="ts">
defineProps<{ open: boolean; title: string; message: string; danger?: boolean; busy?: boolean }>()
defineEmits<{ cancel: []; confirm: [] }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('cancel')">
      <section class="modal-card" role="dialog" aria-modal="true" :aria-label="title">
        <div class="modal-mark" :class="{ danger }">!</div>
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <div class="modal-actions">
          <button class="button button-ghost" :disabled="busy" @click="$emit('cancel')">取消</button>
          <button class="button" :class="danger ? 'button-danger' : 'button-primary'" :disabled="busy" @click="$emit('confirm')">
            {{ busy ? '处理中…' : '确认' }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
