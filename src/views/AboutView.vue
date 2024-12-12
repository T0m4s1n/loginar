<script setup lang="ts">
import { defineOptions } from 'vue';
import Text from '../components/Text.vue';
import AboutComponent from '../components/About.vue';

defineOptions({
  components: {
  Text,
  AboutComponent,
  }
});
</script>

<template>
  <main>
    <Text/>
    <AboutComponent/>
  </main>
</template>
