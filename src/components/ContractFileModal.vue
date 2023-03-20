<script setup>
import JsonEditorVue from 'json-editor-vue';
import {customValidation} from '@/logic/validation.js';
</script>

<template>
  <ADialog
      v-model="isDialogShown"
      subtitle="To start, please put your contract draft template in the box below."
      class="w-[80vw]"
      persistent
  >
    <template #title>
      <div class="flex justify-between">
        <span>Contract Draft Template Loader</span>
        <div class="flex items-center gap-x-3 text-base text-light-emphasis">
          <i class="cursor-pointer i-bx-bxs-help-circle text-info" @click="$emit('docs')" title="See Documentation" />
          <i class="cursor-pointer i-bx-reset text-warning" @click="JSONFile = ''" title="Reset" />
        </div>
      </div>
    </template>
    <div class="a-card-body">
      <JsonEditorVue v-model="JSONFile" class="jse-theme-dark"
        mode="text" :validator="customValidation" />
      <ABtn
          variant="light"
          class="text-sm mr-2"
          icon="i-bx-bxs-send"
          :disabled="parsingError || JSONFile === ''"
          @click="loadFile"
      >
        Load Template
      </ABtn>
      <ABtn
          variant="light"
          class="text-sm mr-2"
          color="warning"
          icon="i-bx-reset"
          :disabled="JSONFile === ''"
          @click="JSONFile = ''"
      >
        Reset
      </ABtn>
    </div>
  </ADialog>
</template>

<script>

export default {
  name: "ContractFileModal",
  emits: ['load', 'docs'],
  data() {
    return {
      isDialogShown: true,
      parsingError: false,
      JSONFile: undefined,
      data: null
    }
  },
  methods: {
    loadFile() {
      this.$emit('load', this.data)
    }
  },
  watch: {
    JSONFile: {
      handler: function (newValue) {
        if(newValue === ''){
          this.parsingError = false
          this.data = null
          return
        }
        try {
          //replace already escaped <"\> with <\\\"> and then replace all <"> with <\">
          const functionFindRegex = /(\w+)\(.*\)}/g;
          for(let match of newValue.matchAll(functionFindRegex)){
            newValue = newValue.replace(match[0], match[0].replace(/(?<!\\)"/g, '\\\"'))
          }
          this.data = JSON.parse(newValue)
          const errors = customValidation(this.data);
          console.log('errors:',errors);
          this.parsingError = errors.length > 0
        } catch (e) {
          console.log(e)
          this.parsingError = true
        }
      },
      immediate: true
    }
  }
}
</script>

<style>

.jse-theme-dark{
  height: 50vh;
  margin: 10px 0px 10px 0px;
}

.jse-group-button{
  display: none;
}

.jse-separator{
  display: none;
}

.jse-sort{
  display: none;
}

.jse-transform{
  display: none;
}

.jse-main{
  height: 50%;
}
</style>