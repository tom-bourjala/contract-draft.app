<template>
  <h1 class="webTitle">
    <img src="@/assets/logo.svg" alt="logo" style="width: 50px; height: 50px; cursor: pointer" @click="$emit('close')" />
    <span style="margin-left: 20px"> Contract Drafter </span>
  </h1>
  <div class="markdown-body">
    <vue-markdown :source="markdown"
      :options="{
        html: true,
        linkify: true,
        typographer: true,
        breaks: true,
      }"
    />
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown-render'

const URL = "https://raw.githubusercontent.com/TerraS77/contract-drafter/main/README.md"

export default {
  name: "docs.vue",
  emits: ['close'],
  components: {
    VueMarkdown
  },
  data() {
    return {
      markdown: ''
    }
  },
  async created() {
    const response = await fetch(URL)
    this.markdown = await response.text()
    //remove first line
    const regex = /# Contract Drafter\n/
    this.markdown = this.markdown.replace(regex, '')
  }
}
</script>

<style scoped>
.webTitle {
  text-align: center;
  font-size: 2em;
  font-weight: bold;
  margin-top: 20px;
  margin-left: 50px;
  margin-bottom: 10px;
  display: flex;
}

.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
  background-color: transparent;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
</style>