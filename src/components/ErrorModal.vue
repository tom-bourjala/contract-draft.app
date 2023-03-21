<template>
  <ADialog
      v-model="isDialogShown"
      color="danger"
      variant="outline"
      subtitle="An error occurred while parsing the file."
      class="w-[480px]"
  >
    <template #title>
      <div class="flex justify-between">
        <span>Parsing Error</span>
        <div class="flex items-center gap-x-3 text-base text-light-emphasis">
          <i class="cursor-pointer i-bx-bxs-help-circle text-info" @click="this.$router.push('/docs')" title="See Documentation" />
          <i class="cursor-pointer i-bx-x text-danger typography-title-danger typography-subtitle-danger typography-text-danger" @click="isDialogShown = false" title="Close" />
        </div>
      </div>
    </template>
    <div :innerHTML="text" class="a-card-body"></div>
  </ADialog>
</template>

<script>
export default {
  name: "ErrorModal",
  props: {
    text: {
      type: String,
      required: true
    }
  },
  emits: ['close'],
  watch: {
    isDialogShown: {
      handler: function (newValue) {
        if (!newValue) {
          this.$emit('close')
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      isDialogShown: true
    }
  }
}
</script>

<style scoped>

</style>