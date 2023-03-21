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
          <i class="cursor-pointer i-bx-bxs-help-circle text-info" @click="this.$router.push('/docs')" title="See Documentation" />
          <i class="cursor-pointer i-bx-reset text-warning" @click="JSONFile = ''" title="Reset" />
          <i v-if="toEditData" class="cursor-pointer i-bx-x text-danger typography-title-danger typography-subtitle-danger typography-text-danger" @click="cancelEdit" title="Close" />
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
        {{toEditData ? "Edit Template" : "Load Template"}}
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

import {autoFixRequired} from "@/logic/validation";
import {compressLZS} from "@/logic/compression";

export default {
  props: ['toEditData'],
  name: "ContractFileModal",
  emits: ['load'],
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
      if(typeof this.data === 'object'){
        let templateString = JSON.stringify(this.data);
        templateString = compressLZS(templateString);
        this.$router.replace({path : '/', query : {t: templateString}});
        setTimeout(() => {
          this.$router.go()
        }, 100)
      }
    },
    cancelEdit() {
      this.$emit('load', this.toEditData)
    },
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
          if(newValue){
            //replace already escaped <"\> with <\\\"> and then replace all <"> with <\">
            const functionFindRegex = /(\w+)\(.*\)}/g;
            const result = newValue.matchAll(functionFindRegex);
            if(result){
              for(let match of result){
                newValue = newValue.replace(match[0], match[0].replace(/(?<!\\)"/g, '\\\"'))
              }
            }
          }
          this.data = JSON.parse(newValue)
          const errors = customValidation(this.data);
          this.parsingError = errors.length > 0
          try{
            //setTimeout(() => {
            //  const fixedJSONFile = autoFixRequired(this.data);
            //  if(JSON.stringify(fixedJSONFile) !== JSON.stringify(this.data)){
            //    this.JSONFile = fixedJSONFile;
            //}
            //}, 5)
          } catch (e) {
            console.log(e)
          }
        } catch (e) {
          console.log(e)
          this.parsingError = true
        }
      },
      immediate: true
    }
  },
  mounted() {
    if(this.toEditData){
      this.JSONFile = this.toEditData
      setTimeout(() => {
        this.data = this.toEditData
        this.parsingError = false
      }, 40)
    }
  }
}
</script>

<style>

.jse-theme-dark{
  height: 70vh;
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
  height: 80%;
}
</style>