<template>
  <h1 class="webTitle">
    <img src="@/assets/logo.svg" alt="logo" style="width: 50px; height: 50px; margin-right: 10px; cursor: pointer" @click="editing = true">
    Contract Drafter
  </h1>
  <ContractFileModal :toEditData="template" v-if="!template || editing" @load="loadTemplate"/>
  <ErrorModal :text="errorDisplay" v-if="errorDisplay" @close="errorDisplay = ''; template = null"/>
  <div class="panel-container" v-if="template">
    <div class="panel-left">
      <div v-for="(content, clause) in template">
        <div class="panel-topic">
          <h2 v-if="hasInputs(clause)" >{{content.label}}</h2>
          <h2 v-if="clause === 'common'">Common</h2>
          <div v-for="(input, key) in content">
            <AInput
                v-if="input.type == 'text'"
                :label="input.label"
                v-model="templateInputs[clause][key].value"
                @mouseenter="templateInputs[clause][key].highlight = true"
                @mouseleave="templateInputs[clause][key].highlight = false"
                @focusin="templateInputs[clause][key].highlight = true"
                @focusout="templateInputs[clause][key].highlight = false"
            >
              <template #label v-if="input.mandatory">
                <label for="a-input-form-x">
                  <span>{{input.label}}</span>
                  <span class="text-red"> *</span>
                </label>
              </template>
            </AInput>
            <ATextarea
                v-else-if="input.type == 'textarea'"
                :label="input.label"
                v-model="templateInputs[clause][key].value"
                @mouseenter="templateInputs[clause][key].highlight = true"
                @mouseleave="templateInputs[clause][key].highlight = false"
                @focusin="templateInputs[clause][key].highlight = true"
                @focusout="templateInputs[clause][key].highlight = false"
            >
              <template #label v-if="input.mandatory">
                <label for="a-input-form-x">
                  <span>{{input.label}}</span>
                  <span class="text-red"> *</span>
                </label>
              </template>
            </ATextarea>
            <ACheckbox v-else-if="input.type == 'checkbox'"
                       class="a-base-input-root a-checkbox-root text-l"
                       v-model="templateInputs[clause][key].value"
                       @mouseenter="templateInputs[clause][key].highlight = true"
                       @mouseleave="templateInputs[clause][key].highlight = false"
                       @focusin="templateInputs[clause][key].highlight = true"
                       @focusout="templateInputs[clause][key].highlight = false"
            >
              {{input.label}}
            </ACheckbox>
          </div>
        </div>
      </div>
    </div>
    <div class="panel-right">
      <div id="draft-output">
        <div v-for="draftClause in draftClauses" class="draft-clause-item">
          <div class="draft-copy-button">
            <ABtn
                icon="i-bx-bxs-copy-alt"
                icon-only
                variant="text"
                @click="copyDraftClauseToClipboard(draftClause.key)"
            />
          </div>
          <div class="draft-clause" :innerHTML="draftClause.content.replaceAll('\n', '<br>')"></div>
        </div>
      </div>
      <div class="copy-button">
        <ABtn
            icon="i-bx-bxs-copy-alt"
            icon-only
            variant="text"
            @click="copyDraftOutputToClipboard"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ContractFileModal from "@/components/ContractFileModal.vue";
import ErrorModal from "@/components/ErrorModal.vue";
import {decompressJSON} from "@/logic/compression";

export default {
  name: 'ContractDrafter',
  props: ["routeEditing", "routeTemplate"],
  components: {ErrorModal, ContractFileModal},
  data() {
    return {
      errorDisplay: '',
      draftOutput: '',
      draftClauses: [],
      templateInputs: {},
      template:null,
      editing:true,
      validInputTypes:['text', 'textarea', 'checkbox']
    }
  },
  beforeMount() {
    if (this.routeTemplate) {
      try{
        let template = decompressJSON(this.routeTemplate)
        this.loadTemplate(template);
        this.initTemplateInputs();
      }catch (e){
        this.errorDisplay = e;
      }
    }
    if (this.routeTemplate && this.routeEditing) {
      this.editing = true;
    }
  },
  watch: {
    templateInputs: {
      handler: function (val, oldVal) {
        try{
          this.updateDraftOutput();
        }catch (e) {
          console.log(e);
        }
      },
      deep: true
    },
    template: {
      handler: function (val, oldVal) {
        try{
          this.initTemplateInputs();
          this.updateDraftOutput();
        }catch (e) {
          console.log(e);
        }
      },
      deep: true
    }
  },
  methods: {
    "getFieldValue"(jurisdiction, key) {
      //if key starts with "$" it's a common field
      let userInput = null;
      let highlight = null;
      let template = null;
      let activeContent = null;
      let inactiveContent = null;
      let mandatory = null;
      let type = null;

      if (key.startsWith('$')){
        key = key.replace('$', '');
        userInput = this.templateInputs.common[key].value;
        highlight = this.templateInputs.common[key].highlight;
        template = this.template.common[key].template;
        activeContent = this.template.common[key].activeContent;
        inactiveContent = this.template.common[key].inactiveContent;
        mandatory = this.template.common[key].mandatory;
        type = this.template.common[key].type;
      } else {
        userInput = this.templateInputs[jurisdiction][key].value;
        highlight = this.templateInputs[jurisdiction][key].highlight;
        template = this.template[jurisdiction][key].template;
        activeContent = this.template[jurisdiction][key].activeContent;
        inactiveContent = this.template[jurisdiction][key].inactiveContent;
        mandatory = this.template[jurisdiction][key].mandatory;
        type = this.template[jurisdiction][key].type;
      }
      if(!inactiveContent) inactiveContent = '';
      if(!activeContent) activeContent = '';
      if(!template) template = '$';

      let value = '';

      if (type === 'checkbox') {
        if (userInput) {
          value = template.replace('$', activeContent);
          if (!value && highlight) value = inactiveContent;
        } else {
          value = template.replace('$', inactiveContent);
          if (!value && highlight) value = activeContent ? activeContent : '';
        }
      } else {
        if (userInput || highlight){
          if(!userInput && highlight) userInput = '[...]';
          value = template.replace('$', userInput);
        }
        else
          value = inactiveContent;
      }

      if (!value && (highlight || mandatory)) {
        value = '[...]';
      }

      if (highlight) {
        value = '<span class="highlight">' + value + '</span>';
      }

      return value;
    },
    "initTemplateInputs"() {
      this.templateInputs = {};
      for (let key in this.template) {
        this.templateInputs[key] = {};
        for (let key2 in this.template[key]) {
          if (key2 !== 'label' && key2 !== 'clause') {
            this.templateInputs[key][key2] = {};
            const defaultVal = this.template[key][key2].default;
            if(this.template[key][key2].type === 'checkbox') this.templateInputs[key][key2].value = defaultVal ? true : false;
            else this.templateInputs[key][key2].value = defaultVal ? defaultVal : '';
            this.templateInputs[key][key2].highlight = false;
          }
        }
      }
    },
    /**
     * This is a test function to test the template data
     * It will display an error message if the template is invalid, with what is wrong
     */
    testTemplate: async function (data) {
      const template = data;
      this.errorDisplay = '';

      //check if the template has the correct format
      if (!template || typeof template !== 'object') {
        return this.errorDisplay = 'The template is not an object. The file should start and end with curly braces ({}), and each clause should be a key in the object.';
      }

      //check if the template has at least one clause
      if (Object.keys(template).length === 0) {
        return this.errorDisplay = 'The template is empty. The file should start and end with curly braces ({}), and each clause should be a key in the object.';
      }

      //check if every data field it's type
      const validTypes = {
        "template": 'string',
        "label": 'string',
        "activeContent": 'string',
        "inactiveContent": 'string',
        "type": 'string',
        "highlight": 'boolean'
      }

      //check if the template every clause has a label and a clause property
      for (let key in template) {
        if(key === "common") continue;
        if (!template[key].label) {
          return this.errorDisplay = 'The clause <b>"' + key + '"</b> is missing a label. Every clause should have a label property, as the display name of the clause.';
        }
        if (!template[key].clause) {
          return this.errorDisplay = 'The clause <b>"' + key + '"</b> is missing a clause. Every clause should have a clause property, as the text of the clause.';
        }
      }

      //check if every clause input has a label and a valid type
      for (let key in template) {
        if(key === "common") continue;
        for (let key2 in template[key]) {
          if (key2 !== 'label' && key2 !== 'clause') {
            if (!template[key][key2].label) {
              return this.errorDisplay = 'The input <b>"' + key2 + '"</b> of the clause <b>"' + key + '"</b> is missing a label. Every clause input should have a label property, as the display name of the clause input.';
            }
            if (!template[key][key2].type) {
              return this.errorDisplay = 'The input <b>"' + key2 + '"</b> of the clause <b>"' + key + '"</b> is missing a type. Every clause input should have a type property, as the type of the clause input.';
            }
            if (!this.validInputTypes.includes(template[key][key2].type)) {
              return this.errorDisplay = 'The input <b>"' + key2 + '"</b> of the clause <b>"' + key + '"</b> has an invalid type. The type property should be one of the following:' + validTypes.join(', ') + '.';
            }
          }
        }
      }

      //check if every clause input has a valid template
      for (let key in template) {
        if(key === "common") continue;
        for (let key2 in template[key]) {
          if (key2 !== 'label' && key2 !== 'clause') {
            if (template[key][key2].template) {
              if (!template[key][key2].template.includes('$')) {
                return this.errorDisplay = 'The input <b>"' + key2 + '"</b> of the clause <b>"' + key + '"</b> has an invalid template. The template property should contain a $ character, which will be replaced by the clause input value.';
              }
            }
          }
        }
      }

      //join statements are defined such as join([content,...], separator, prefix, suffix)
      //check if every join statement has a valid format
      for (let key in template) {
        if(key === "common") continue;
        try{
          const clause = template[key].clause;
          const joinRegex = /{{join\((.*?)\)}}/g;
          const joins = clause.matchAll(joinRegex);
          for (const join of joins) {
            let statement = join[1];

            const contentArg = statement.match(/\[(.*?)\]/g)[0];
            if (!contentArg) {
              return this.errorDisplay = 'The join statement <b>"' + join[0] + '"</b> of the clause <b>"' + key + '"</b> is missing a content argument. The content argument should be a list of clause inputs, separated by commas. (format: join([content,...], separator, prefix, suffix))';
            }

            let content = contentArg.replaceAll(/\[|\]/g, '');
            const contentArr = content.split(',').map(item => item.trim()).filter(item => item);
            if (contentArr.length === 0) {
              return this.errorDisplay = 'The join statement <b>"' + join[0] + '"</b> of the clause <b>"' + key + '"</b> is missing a content argument. The content argument should be a list of clause inputs, separated by commas. (format: join([content,...], separator, prefix, suffix))';
            }

            statement = statement.replaceAll(contentArg, '');
            let args = statement.match(/'(.*?)'|"(.*?)"|`(.*?)`/g);
            if (!args) {
              return this.errorDisplay = 'The join statement <b>"' + join[0] + '"</b> of the clause <b>"' + key + '"</b> is missing a separator argument. The separator argument should be a string, which will be used to separate the content values. (format: join([content,...], separator, prefix, suffix))';
            }
            args = args.map(item => item.replaceAll(/['"`]/g, ''));
            if (args.length === 0) {
              return this.errorDisplay = 'The join statement <b>"' + join[0] + '"</b> of the clause <b>"' + key + '"</b> has  an error regarding it\'s separator argument. The separator argument should be a string, which will be used to separate the content values. (format: join([content,...], separator, prefix, suffix))';
            }

            if(args.length > 3) {
              return this.errorDisplay = 'The join statement <b>"' + join[0] + '"</b> of the clause <b>"' + key + '"</b> has  an error regarding it\'s arguments. The join statement should have a maximum of 4 arguments. (format: join([content,...], separator, prefix, suffix))';
            }
          }
        }catch (e){
          console.log(e);
          return this.errorDisplay = 'An error occurred while parsing a join statements of the clause <b>"' + key + '"</b>. Please check the format of the join statements.<br/><br/>Error: ' + e;
        }
      }

      //combine statements are defined such as iterate([content,...], prefix, suffix, default)
      //check if every combine statement has a valid format
      for (let key in template) {
        if(key === "common") continue;
        try{
          const clause = template[key].clause;
          const combineRegex = /{{combine\((.*?)\)}}/g;
          const combines = clause.matchAll(combineRegex);
          for (const combine of combines) {
            let statement = combine[1];

            const contentArg = statement.match(/\[(.*?)\]/g)[0];
            if (!contentArg) {
              return this.errorDisplay = 'The combine statement <b>"' + combine[0] + '"</b> of the clause <b>"' + key + '"</b> is missing a content argument. The content argument should be a list of clause inputs, separated by commas. (format: combine([content,...], prefix, suffix, default))';
            }

            let content = contentArg.replaceAll(/\[|\]/g, '');
            const contentArr = content.split(',').map(item => item.trim()).filter(item => item);
            if (contentArr.length === 0) {
              return this.errorDisplay = 'The combine statement <b>"' + combine[0] + '"</b> of the clause <b>"' + key + '"</b> is missing a content argument. The content argument should be a list of clause inputs, separated by commas. (format: combine([content,...], prefix, suffix, default))';
            }

            statement = statement.replaceAll(contentArg, '');
            let args = statement.match(/'(.*?)'|"(.*?)"|`(.*?)`/g);
            args =  args ? args : [];
            if (args.length > 3) {
              return this.errorDisplay = 'The combine statement <b>"' + combine[0] + '"</b> of the clause <b>"' + key + '"</b> has too many arguments. The combine statement should have a maximum of 4 arguments. (format: combine([content,...], prefix, suffix, default))';
            }
          }
        }catch (e){
          console.log(e);
          return this.errorDisplay = 'An error occurred while parsing a combine statements of the clause <b>"' + key + '"</b>. Please check the format of the combine statements.<br/><br/>Error: ' + e;
        }
      }
    },
    loadTemplate: function (data) {
      if(typeof data === 'string') data = JSON.parse(data);
      this.testTemplate(data);
      this.template = data;
      this.editing = false;
    },
    updateDraftOutput: function() {
      let draftOutput = '';
      let draftClauses = [];
      const common = this.template.common;
      const draftKeys = Object.keys(this.template).filter(key => key !== "common");

      for(let key of draftKeys){
        const contentDraft = this.getClauseDraft(key, common);
        draftClauses.push({key, content:contentDraft});
        draftOutput += contentDraft;
      }

      this.draftOutput = draftOutput;
      this.draftClauses = draftClauses;
    },

    getClauseDraft: function (draftKey, common) {
      let draft = '';
      let area = this.template[draftKey];
      let clause = area.clause;
      draft += '<h1>' + area.label + '</h1>';

      clause = this.replaceKeysWithValues(draftKey, area, clause);
      clause = this.replaceCommonKeysWithValues(common, clause);
      clause = this.processJoinStatements(draftKey, clause);
      clause = this.processCombineStatements(draftKey, clause);

      return draft + clause;
    },

    replaceKeysWithValues: function(draftKey, area, clause) {
      for (let key in area) {
        if (key !== 'label' && key !== 'clause') {
          const value = this.getFieldValue(draftKey, key);
          const clauseRegex = new RegExp('{{' + key + '}}', 'g');
          clause = clause.replaceAll(clauseRegex, value);
        }
      }
      return clause;
    },
    replaceCommonKeysWithValues: function(common, clause) {
      for (let key in common) {
        const value = this.getFieldValue('common', key);
        const clauseRegex = new RegExp('{{\\$' + key + '}}', 'g');
        clause = clause.replaceAll(clauseRegex, value);
      }
      return clause;
    },

    processJoinStatements: function(draftKey, clause) {
      const joinRegex = /{{join\((.*?)\)}}/g;
      const joins = clause.matchAll(joinRegex);
      for (const join of joins) {
        clause = clause.replaceAll(join[0], this.getJoinValue(this, join[1], draftKey));
      }
      return clause;
    },

     getJoinValue: function(statement, draftKey) {
      let [contentArg, ...args] = statement.match(/\[(.*?)\]|'(.*?)'|"(.*?)"|`(.*?)`/g);
      let contentValues = this.getContentValues(draftKey, contentArg);
      let [separator, prefix, suffix] = this.parseArguments(args);

      const containHighlight = contentValues.some(item => item.includes('<span class="highlight">'));
      if (containHighlight) {
        [prefix, suffix, separator] = this.highlight(prefix, suffix, separator);
      }
      let joinValue = contentValues.join(separator);
      return joinValue.length > 0 ? prefix + joinValue + suffix : '';
    },

     processCombineStatements: function(draftKey, clause) {
      const combineRegex = /{{combine\((.*?)\)}}/g;
      const combines = clause.matchAll(combineRegex);
      for (const combine of combines) {
        clause = clause.replaceAll(combine[0], this.getCombineValue(combine[1], draftKey));
      }
      return clause;
    },

    getCombineValue: function(statement, draftKey) {
      let [contentArg, ...args] = statement.match(/\[(.*?)\]|'(.*?)'|"(.*?)"|`(.*?)`/g);
      let contentValues = this.getContentValues(draftKey, contentArg);
      let [prefix, suffix, defaultValue] = this.parseArguments(args);

      const containHighlight = contentValues.some(item => item.includes('<span class="highlight">'));
      if (containHighlight) {
        [prefix, suffix] = this.highlight(prefix, suffix);
      }

      let combineValue = contentValues.length > 0 ? this.formatCombineValue(contentValues, prefix, suffix) : defaultValue;
      return combineValue;
    },
        getContentValues: function(draftKey, contentArg) {
      let content = contentArg.replaceAll(/\[|\]/g, '');
      let contentArr = content.split(',').map(item => item.trim()).filter(item => item);
      return contentArr.map(item => this.getFieldValue(draftKey, item)).filter(item => item.length > 0);
    },
        parseArguments: function(args) {
      return args.map(item => item.replaceAll(/['"`]/g, ''));
    },

    highlight: function(prefix, suffix, separator = '') {
      return [
        '<span class="highlight">' + prefix + '</span>',
        '<span class="highlight">' + suffix + '</span>',
        '<span class="highlight">' + separator + '</span>'
      ];
    },
        formatCombineValue: function(contentValues, prefix, suffix) {
      let formattedValue = prefix;
      contentValues.forEach((value, index) => {
        formattedValue += value;
        if (index === contentValues.length - 2) {
          formattedValue += ' and ';
        } else if (index < contentValues.length - 1) {
          formattedValue += ', ';
        }
      });
      return formattedValue + suffix;
    },
    copyDraftOutputToClipboard: async function () {
      let textToCopy = this.draftOutput;
      const H1Regex = /<h1>(.*?)<\/h1>/g;
      const H2Regex = /<h2>(.*?)<\/h2>/g;
      const H3Regex = /<h3>(.*?)<\/h3>/g;
      const spanRegex = /<span class="highlight">(.*?)<\/span>/g;
      textToCopy = textToCopy.replaceAll(H1Regex, '\n\n$1\n');
      textToCopy = textToCopy.replaceAll(H2Regex, '\n\n$1\n');
      textToCopy = textToCopy.replaceAll(H3Regex, '\n\n$1\n');
      textToCopy = textToCopy.replaceAll(spanRegex, '$1');
      try {
        await navigator.clipboard.writeText(textToCopy);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    },
    copyDraftClauseToClipboard: async function (key) {
      let textToCopy = this.draftClauses.find(clause => clause.key === key).content;
      const H1Regex = /<h1>(.*?)<\/h1>/g;
      const H2Regex = /<h2>(.*?)<\/h2>/g;
      const H3Regex = /<h3>(.*?)<\/h3>/g;
      const spanRegex = /<span class="highlight">(.*?)<\/span>/g;
      textToCopy = textToCopy.replaceAll(H1Regex, '\n\n$1\n\n');
      textToCopy = textToCopy.replaceAll(H2Regex, '\n\n$1\n\n');
      textToCopy = textToCopy.replaceAll(H3Regex, '\n\n$1\n\n');
      textToCopy = textToCopy.replaceAll(spanRegex, '$1');
      try {
        await navigator.clipboard.writeText(textToCopy);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    },
    hasInputs: function (clause) {
      for (let key in this.template[clause]) {
        if (key !== 'label' && key !== 'clause') {
          return true;
        }
      }
      return false;
    }
  },
};
</script>

<style scoped>

.a-base-input-root {
  margin: 10px;
}

.a-checkbox-root{
  margin: 10px 10px 10px 20px;
}

.panel-container {
  display: flex;
  flex-direction: row;
}

.panel-left {
  width: 30%;
  padding: 20px;
  border-right: 1px solid #ccc;
}

.panel-right {
  width: 70%;
  padding: 40px;
  max-width: 1000px;
}

.panel-topic {
  margin: 20px;
}

.webTitle {
  text-align: center;
  font-size: 2em;
  font-weight: bold;
  margin: 20px;
}

#draft-output {
  width: 100%;
  height: 100%;
  padding: 10px;
  background: transparent;
}
</style>

<style>
.highlight{
  color: hsl(var(--a-primary));
}

.draft-clause > h1 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 20px 10px 10px 40px;
}

.panel-topic > h2 {
  font-size: 1.2em;
  font-weight: bold;
  margin: 10px 0;
}

.copy-button {
  position: absolute;
  right: 15vw;
  top: 100px;
}

.draft-clause-item {
  position: relative;
}

.draft-copy-button {
  position: absolute;
  left: 0;
  top: -3px;
}
</style>