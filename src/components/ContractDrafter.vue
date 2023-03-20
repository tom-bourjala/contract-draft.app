<template>
  <h1 class="webTitle">
    <img src="@/assets/logo.svg" alt="logo" style="width: 50px; height: 50px; margin-right: 10px; cursor: pointer" @click="template = null">
    Contract Drafter
  </h1>
  <ContractFileModal v-if="!template" @load="loadTemplate" @docs="$emit('docs')"/>
  <ErrorModal :text="errorDisplay" v-if="errorDisplay" @close="errorDisplay = ''; template = null" @docs="$emit('docs')"/>
  <div class="panel-container" v-if="template">
    <div class="panel-left">
      <div v-for="(content, clause) in template">
        <div class="panel-topic">
          <h2>{{content.label}}</h2>
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
      <div id="draft-output" :innerHTML="draftOutput"></div>
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

export default {
  name: 'ContractDrafter',
  components: {ErrorModal, ContractFileModal},
  emits: ['docs'],
  data() {
    return {
      errorDisplay: '',
      draftOutput: '',
      templateInputs: {},
      template:null
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
      let userInput = this.templateInputs[jurisdiction][key].value;
      const highlight = this.templateInputs[jurisdiction][key].highlight;
      let template = this.template[jurisdiction][key].template;
      let activeContent = this.template[jurisdiction][key].activeContent;
      let inactiveContent = this.template[jurisdiction][key].inactiveContent;
      const mandatory = this.template[jurisdiction][key].mandatory;

      if(!inactiveContent) inactiveContent = '';
      if(!activeContent) activeContent = '';
      if(!template) template = '$';

      const type = this.template[jurisdiction][key].type;
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
        if (!template[key].label) {
          return this.errorDisplay = 'The clause <b>"' + key + '"</b> is missing a label. Every clause should have a label property, as the display name of the clause.';
        }
        if (!template[key].clause) {
          return this.errorDisplay = 'The clause <b>"' + key + '"</b> is missing a clause. Every clause should have a clause property, as the text of the clause.';
        }
      }

      //check if every clause input has a label and a valid type
      for (let key in template) {
        for (let key2 in template[key]) {
          if (key2 !== 'label' && key2 !== 'clause') {
            if (!template[key][key2].label) {
              return this.errorDisplay = 'The input <b>"' + key2 + '"</b> of the clause <b>"' + key + '"</b> is missing a label. Every clause input should have a label property, as the display name of the clause input.';
            }
            if (!template[key][key2].type) {
              return this.errorDisplay = 'The input <b>"' + key2 + '"</b> of the clause <b>"' + key + '"</b> is missing a type. Every clause input should have a type property, as the type of the clause input.';
            }
            if (!['text', 'checkbox'].includes(template[key][key2].type)) {
              return this.errorDisplay = 'The input <b>"' + key2 + '"</b> of the clause <b>"' + key + '"</b> has an invalid type. The type property should be one of the following: text, checkbox.';
            }
          }
        }
      }

      //check if every clause input has a valid template
      for (let key in template) {
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
      this.testTemplate(data);
      this.template = data;
    },
    updateDraftOutput: function () {
      let draftOutput = '';
      for (let jurisdictionKey in this.template) {
        let jurisdiction = this.template[jurisdictionKey];
        let clause = jurisdiction.clause;
        draftOutput += '<h1>' + jurisdiction.label + '</h1>';
        for (let key in jurisdiction) {
          if (key !== 'label' && key !== 'clause') {
            const value = this.getFieldValue(jurisdictionKey, key);

            const clauseRegex = new RegExp('{{' + key + '}}', 'g');
            clause = clause.replaceAll(clauseRegex, value);
          }
        }

        //find join statements
        const joinRegex = /{{join\((.*?)\)}}/g;
        const joins = clause.matchAll(joinRegex);

        //join statements are defined such as join([content,...], separator, prefix, suffix)
        for (const join of joins) {
          let statement = join[1];

          const contentArg = statement.match(/\[(.*?)\]/g)[0];
          let content = contentArg.replaceAll(/\[|\]/g, '');
          const contentArr = content.split(',').map(item => item.trim()).filter(item => item);
          const contentValues = contentArr.map(item => this.getFieldValue(jurisdictionKey, item)).filter(item => item.length > 0);

          statement = statement.replaceAll(contentArg, '');
          const args = statement.match(/'(.*?)'|"(.*?)"|`(.*?)`/g).map(item => item.replaceAll(/['"`]/g, ''));
          let separator = args[0];
          let prefix = '';
          let suffix = '';
          if (args.length > 1) {
            prefix = args[1].replaceAll(/['"`]/g, '');
            if (args.length > 2) {
              suffix = args[2].replaceAll(/['"`]/g, '');
            }
          }
          const containHighlight = contentValues.some(item => item.includes('<span class="highlight">'));
          if(containHighlight){
            prefix = '<span class="highlight">' + prefix + '</span>';
            suffix = '<span class="highlight">' + suffix + '</span>';
            separator = '<span class="highlight">' + separator + '</span>';
          }
          let joinValue = contentValues.join(separator);
          if (joinValue.length > 0) {
            joinValue = prefix + contentValues.join(separator) + suffix;
          }
          clause = clause.replaceAll(join[0], joinValue);
        }

        //find combine statements
        const findCombineRegex = /{{combine\((.*?)\)}}/g;
        const combineStatements = clause.matchAll(findCombineRegex);

        // combine statements are defined such as iterate([content,...], prefix, suffix, default)
        for (const combine of combineStatements) {
          let statement = combine[1];

          const contentArg = statement.match(/\[(.*?)\]/g)[0];
          let content = contentArg.replaceAll(/\[|\]/g, '');
          const contentArr = content.split(',').map(item => item.trim()).filter(item => item);
          const contentValues = contentArr.map(item => this.getFieldValue(jurisdictionKey, item)).filter(item => item.length > 0);

          statement = statement.replaceAll(contentArg, '');
          const args = statement.match(/'(.*?)'|"(.*?)"|`(.*?)`/g).map(item => item.replaceAll(/['"`]/g, ''));
          let prefix = '';
          let suffix = '';
          let defaultValue = '';
          if (args.length > 0) {
            prefix = args[0].replaceAll(/['"`]/g, '');
            if (args.length > 1) {
              suffix = args[1].replaceAll(/['"`]/g, '');
              if (args.length > 2) {
                defaultValue = args[2].replaceAll(/['"`]/g, '');
              }
            }
          }
          const containHighlight = contentValues.some(item => item.includes('<span class="highlight">'));
          if(containHighlight){
            prefix = '<span class="highlight">' + prefix + '</span>';
            suffix = '<span class="highlight">' + suffix + '</span>';
          }
          let combineValue = contentValues.join('');
          if (combineValue.length > 0) {
            combineValue = prefix;
            for(let i = 0; i < contentValues.length; i++){
              combineValue += contentValues[i];

              //if before last item, add "and"
              if(i === contentValues.length - 2){
                combineValue += ' and ';
              }
              //if not before last item, add ","
              else if(i < contentValues.length - 1){
                combineValue += ', ';
              }
            }
            combineValue += suffix;
          } else {
            combineValue = defaultValue;
          }
          clause = clause.replaceAll(combine[0], combineValue);
        }

        draftOutput += clause;
      }
      this.draftOutput = draftOutput;
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

#draft-output > h1 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 20px 10px 10px 10px;
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
</style>