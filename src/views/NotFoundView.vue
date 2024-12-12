<script setup lang="ts">
import { defineOptions } from 'vue';
import NotFoundComponent from '../components/NotFound.vue';

defineOptions({
  components: {
  NotFoundComponent,
  }
});
</script>

<template>
  <main>
    <NotFoundComponent/>
  </main>
</template>
