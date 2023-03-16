<script setup>
import ContractDrafter from "@/components/ContractDrafter.vue";
import Docs from "@/components/Docs.vue";
</script>

<template>
  <Docs v-if="isDocsShown" @close="isDocsShown = false" />
  <ContractDrafter v-else="!isDocsShown" @docs="isDocsShown = true" />
</template>

<script>

export default {
  name: "App",
  data() {
    return {
      isDocsShown: false
    }
  }
}

</script>

<style>
:root.dark{
  --a-primary: 125, 94%, 72% !important;
  color-scheme: dark;
}
</style>
