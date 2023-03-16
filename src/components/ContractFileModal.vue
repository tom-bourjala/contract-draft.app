<template>
  <ADialog
      v-model="isDialogShown"
      subtitle="To start, please put your contract draft template in the box below."
      class="w-[800px]"
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
      <textarea v-if="parsingError || !data"
          v-model="JSONFile"
          class="w-full h-60 p-4 text-sm rounded-lg JSONFile"
      >
      </textarea>
      <vue-json-pretty v-if="!parsingError && data" :data="data" class="JSONFile"
                       :showLine="false"
                       :showDoubleQuotes="false"
                       :virtual="true"
                       :editable="true"
      ></vue-json-pretty>
      <AAlert
          v-if="parsingError"
          color="danger"
          variant="outline"
          style="margin:20px 0px 20px 0px"
      >
        An error occurred while parsing the file.
      </AAlert>
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
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
export default {
  name: "ContractFileModal",
  emits: ['load', 'docs'],
  components: {
    VueJsonPretty,
  },
  data() {
    return {
      isDialogShown: true,
      parsingError: false,
      JSONFile: '',
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
          this.parsingError = false
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

<style scoped>
.JSONFile {
  background-color: #1e1e1e;
  color: #d4d4d4;
  border: 1px solid #3a3a3a;
  margin: 10px 0px 10px 0px;
  color-scheme: dark;
}
</style>

<style>
.vjs-tree{
  margin: 10px 0px 10px 0px;
  padding: 10px;
  color-scheme: dark;
}

.vjs-tree-node.is-highlight,
.vjs-tree-node:hover {
  background-color: #1a1a1a;
}
</style>