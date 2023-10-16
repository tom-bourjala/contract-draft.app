# Contract Drafter

## About

Contract Drafter is a web app that allows users to customize contract clauses based on a contract template. 
It is built with Vue.js and Tailwind CSS.

## How to Use Contract Drafter Web App

1. Visit [contract-drafter.com](https://contract-drafter.com).
2. Click on the "Load Template" button to open a modal with a textarea.
3. Paste your template JSON file in the textarea and click on the "Load Template" button within the modal.
4. The app will display two sides:
    - **Left side**: A list of inputs to customize the contract clauses.
    - **Right side**: The resulting contract clauses based on the provided input.
5. Fill in the inputs.
6. Click on the top right button to copy the resulting contract content to your clipboard.

### Sharing Templates

You can share your template with other users by either:

- Copying the template JSON and sending it to the other user.
- Copying the URL of the page and sending it to the other user.

## Constructing a Contract Template

A contract template is a JSON object where each key represents a clause or a section of the contract. 

Each key has an associated JSON object that contains information about the clause, input fields, and formatting options. The general structure of a clause object looks like this:

```json
{
   "clause1": {
     "label": "Label for the clause",
     "input1": { /* ... */ },
     "input2": { /* ... */ },
     //...
     "clause": "The text of the clause with placeholders for input values, like {{input1}}, {{input2}}, ...",
   },
    "clause2": {
      "label": "Label for the clause",
      "input1": { /* ... */ },
      "input2": { /* ... */ },
      //...
      "clause": "The text of the clause with placeholders for input values, like {{input1}}, {{input2}}, ...",
    },
    //...
}
```

### Clauses

A clause is a part of the contract template that represents a paragraph or a section of the contract. It contains the text of the clause with placeholders for input values, which will be replaced with the actual input values when the contract is generated.

#### Clause Attributes

| Attribute | Type   | Description                                                                 | Mandatory | Default |
|-----------|--------|-----------------------------------------------------------------------------|-----------|---------|
| label     | String | The label for the clause.                                                   | Yes       | N/A     |
| clause    | String | The text of the clause with placeholders for input values, like {{input1}}. | Yes       | N/A     |

### Inputs

Inputs are the fields that allow users to customize the contract clauses. Each input has a unique key within the clause object and an associated JSON object that contains information about the input field, its type, label, and other attributes.

#### Input Attributes

| Attribute | Type    | Description                                                                                                           | Mandatory | Default |
|-----------|---------|-----------------------------------------------------------------------------------------------------------------------|-----------|---------|
| label     | String  | The label for the input field.                                                                                        | Yes       | N/A     |
| type      | String  | The input type (text, checkbox, textarea...).                                                                         | Yes       | N/A     |
| mandatory | Boolean | Whether the input field is mandatory (if the input of a mandatory text is empty, the text displayed will be default). | No        | `false` |
| template  | String  | A text template where the value of field will be inserted (example : `'such as $'`), allowing prefix/suffix text.     | No        | `'$'`   |

#### Text

The text input type is used to display a text input field. It takes the additional attributes:

| Attribute       | Type   | Description                                       | Mandatory | Default |
|-----------------|--------|---------------------------------------------------|-----------|---------|
| default         | String | The default value of the input field.             | No        | `''`    |
| inactiveContent | String | The text to be displayed when the input is empty. | No        | `''`    |

#### Textarea

The textarea input type is used to display a textarea input field. It takes the additional attributes:

| Attribute       | Type   | Description                                       | Mandatory | Default |
|-----------------|--------|---------------------------------------------------|-----------|---------|
| default         | String | The default value of the input field.             | No        | `''`    |
| inactiveContent | String | The text to be displayed when the input is empty. | No        | `''`    |

#### checkbox

The checkbox input type is used to display a checkbox input field. It takes the additional attributes:

| Attribute       | Type    | Description                                           | Mandatory | Default |
|-----------------|---------|-------------------------------------------------------|-----------|---------|
| default         | Boolean | The default value of the input field.                 | No        | `false` |
| inactiveContent | String  | The text to be displayed when the box is not checked. | No        | `''`    |
| activeContent   | String  | The text to be displayed when the box is checked.     | No        | `''`    |


### Functions

Functions are used to manipulate input values within a clause, mostly to concatenate multiple input values with a delimiter. They are used within the `clause` attribute of a clause object.

#### Join

The `join` function is used to join an array of input values with a specified delimiter. It takes three arguments:
 
- An array of input keys.
- The delimiter to be used for joining the values.
- A facultative prefix to be added before the joined values.
- A facultative suffix to be added after the joined values.

```
join([input1, input2, ...], "delimiter", "prefix", "suffix")
```

***Example:***

```json
{
   "includes":{
      //...
     "clause": "This agreement includes {{join([contractContainSchedules, contractContainExhibits, contractContainAppendices, contractContainAttachments], ', ', 'the following: ', '.')}}"
   }
}
```

In this example, the `join` function concatenates the values of the `contractContainSchedules`, `contractContainExhibits`, `contractContainAppendices`, and `contractContainAttachments` inputs with a comma and a space as a delimiter. It also adds a prefix and a suffix to the joined values.

If the values were:

- contractContainSchedules: "schedules"
- contractContainExhibits: "exhibits"
- contractContainAppendices: ""
- contractContainAttachments: "attachments"

The resulting clause would be:

```
This agreement includes the following: schedules, exhibits, attachments.
```

#### Combine

The `combine` function is a variation of the `join` function that concatenates the values of multiple inputs with a dynamic separator, taking the form "{input1}, {input2} and {input3}". 
It takes four arguments:  

- An array of input keys.
- A facultative prefix to be added before the joined values.
- A facultative suffix to be added after the joined values.
- A facultative default value to be used if the array of input keys is empty.

```
combine([input1, input2, ...], "prefix", "suffix", "default")
```

***Example:***

```json
{
   "includes":{
      //...
      "clause": "This agreement includes {{combine([contractContainSchedules, contractContainExhibits, contractContainAppendices, contractContainAttachments])}}"
   }
}
```

In this example, the `combine` function concatenates the values of the `contractContainSchedules`, `contractContainExhibits`, `contractContainAppendices`, and `contractContainAttachments` inputs with it's dynamic separator.

If the values were:

- contractContainSchedules: "schedules"
- contractContainExhibits: "exhibits"
- contractContainAppendices: ""
- contractContainAttachments: "attachments"

The resulting clause would be:

```
This Agreement includes schedules, exhibits and attachments.
```

### Contract Template Example

Here is an example of a contract template:

```json
{
  "jurisdiction": {
    "label": "Jurisdiction",
    "state": {
      "type": "text",
      "label": "State",
      "default": "[...]",
      "mandatory": true
    },
    "county": {
      "type": "text",
      "label": "County"
    },
    "city": {
      "type": "text",
      "label": "City",
      "default": "[...]"
    },
    "courtLevel": {
      "type": "text",
      "label": "Court Level"
    },
    "asExclusiveJurisdiction": {
      "type": "checkbox",
      "label": "As Exclusive Jurisdiction",
      "activeContent": "exclusive",
      "inactiveContent": "non-exclusive"
    },
    "clause": "Each party to this Agreement irrevocably agrees that the courts {{courtLevel}} of {{join([state, county, city], \", \")}} shall have {{asExclusiveJurisdiction}} jurisdiction to hear, settle and/or determine any dispute, controversy or claim including any non-contractual dispute, controversy or claim arising out or in connection with this Agreement, including any question regarding its existence, validity, formation or termination."
  },
  "choiceOfLaw": {
    "label": "Choice of Law",
    "choiceOfLaw": {
      "type": "text",
      "label": "Choice of Law",
      "default": "[...]"
    },
    "exclusionOfLaw": {
      "type": "text",
      "label": "Exclusion of Law",
      "default": "",
      "inactiveContent": "",
      "template": "The $ shall not apply."
    },
    "contractContainSchedules": {
      "type": "checkbox",
      "label": "Contract contain schedules",
      "default": false,
      "activeContent": "schedules",
      "inactiveContent": ""
    },
    "contractContainExhibits": {
      "type": "checkbox",
      "label": "Contract contain exhibits",
      "default": false,
      "activeContent": "exhibits",
      "inactiveContent": ""
    },
    "contractContainAppendices": {
      "type": "checkbox",
      "label": "Contract contain appendices",
      "default": false,
      "activeContent": "appendices",
      "inactiveContent": ""
    },
    "contractContainAttachments": {
      "type": "checkbox",
      "label": "Contract contain attachments",
      "default": false,
      "activeContent": "attachments",
      "inactiveContent": ""
    },
    "clause": "This Agreement and all related documents including all {{combine([contractContainSchedules, contractContainExhibits, contractContainAppendices, contractContainAttachments], \"\", \" and all\")}} claims or causes of action (whether in contract, tort or statue) that may based upon, arise out of or related to this Agreement or the negotiation, execution or performance of this Agreement (including any claim or cause of action based upon, arising out of or related to any representation or warranty made in or in connection with this Agreement or as inducement to enter into this Agreement), shall be governed by and enforced in accordance with the laws of {{choiceOfLaw}} including its statutes of limitations and procedural rules without giving effect to the conflicts of law principles, rules or provisions of such state hereof to the extent such principles, rules or provisions would require or allow the application of the laws of any jurisdictions other than those of {{choiceOfLaw}}. {{exclusionOfLaw}}"
  }
}
```

>*Try it out [here](https://contract-drafter.com/?t=N4IgVgrgTglgzgExgYwC4wPYDsQC5QA2AhgEYCmBeIAUtPEmpjgDQhypGpl6ioCeAB264QXAB6oQrYuUoiAyhy5SQCMgDMiEApJEBtAHRGAuioC2RLAk4YofPKigQyAX1bIMELPx6jBw0TIJFRkKKgBhT297NxBkGB98PyEqcUlpUjCRcIT7VjVNbV0QQxMQWI9oVAAZMgA3LN5-VKD0kFC5EEiqgAJahspYojgAUTFkAgg4GAbaWEQUdGxffhSRZAALMmQAaxIMMRDMzoBBOB6xiamZsh65%2BkWmFSJGBsjvMm8qIKvphpUYFgXug3tguF8RFhsABaH6TP7cCrEKYBEYvDY9AREKD8HqoDB4jbwHonADmUDIZDMn1QPRgUApdQwyFIBD4PSI5Mp51QG04hNulRx52AwCFNXqFBcLh6GHUPVFYAwgIAFHp2JwyMwepVotr4vxjNqADpSHqmgCU0p6cD5BAIPT5DQVwGGl3hN3uC0Y2GtkHmDCWWDxBK22O1cDIqFQBFulgQAHpbD01FwoGZAXGsOykHABBAuPqwVAMA0oHB2cmJkQYGY6VgrkgsKSOdmelCsNCPN4oMCIEQHbn84WdcXS2Ry5WoDriLWOfNAS3PLTk4DR1gsNsgz0AO4JDG84lkilUmnawGNxet9kAR2c7CYPQppOxTZbCXOQXg4OQWp6dQHGAkH4bV1FsCxt2TNMMyBIMDHKdwNmVX8AHl1GqIgd18DoIiQlBbjlPpMJUTZkLINCMKwpJVgCNIjlkXCyNleVKJUAotB0KhSgMUxWAsKwbDsBwnFcVg4WubAKOI6jmhEOiMgYkR3Qk4NCNY1guDMARiGUEQABUth6AASG07QdKFaSIARtL4eCKmLYF3g4QF5E2MgEG0Mg4BWWS4i2XZ9kOBSsi6By0HXZzgzgNyPNjbzWGBG4nJpKhoq2WKvIQuIwtQJyaywMYiRID8fLWPztj2A56JCpze3C7tIp6IIipKhLXjIZKIRAZqYGK1BvPsntHLBfKTmsz4GEymSyrcgKquCzpauBCL8o5carHw%2BKQES0EPi6qyhA238BvcHK8sBE5o3RalvG86aAlmyqgvaY4Ihyla104DhNhu-rnnazrii%2B66aROuJkUjKgDKPLlT28VsEA5e0nwoTVEYQZkIF%2B84L0mN8kYdUUPDMYrNzVBq6tykaXJizy4CLIa0HOgqxBa-qGccYbvFG9bJvpiLKeZy7vo2bGjXNEBTRNEAEYJy1rWrWtzirLRI2V%2BVEuwHoVR3LZeQnesBeBbV8RxWVpw1VBnAtQl%2BQsdkSGGdyeggARsG1bF4AIgtmPNlGdOd-FCRhk9fr9-X2zIUkMHQTgmG1IJtgLR9kyEKAwPTSxf19w9zmPSkw5VXGIHxyx2UVusVZRX3NeDR3I0R133fneAr2XX3kwpAPEaDsuUYEClI25yDpx3bFe2iHoLDUQ3V2DbtNx9YM915YO89hsPk2GesPN-MOg5pA3ASD3OSQ3mkLQjMyenIHpo7LTdEZIdl4yarAM9-RHPuQDwoGsBtbgrwPIZYgO51YulIvhKSO5rTF3xh%2BG0SgCxeV9gQWsCQ47YHOK-AezJ3LQAHE%2BOmu59zt1JDMK8Gh1BbhDAKdc6g0FoHAaAzEsAGwwG0l5bUTg4p%2B1wXUVuWDfZwAgJsRBmpHQTjIIRE%2BhlWg0htKIjEA8LwcLitw4hqcSwCOmEIncngCCIwpHeekBFpwDgIBgHcdCDqMMwapeUEdQHgL7v6B4S9lb62nLySwhIMCRl9kTPCqF0KYWlAYF04ldFYGgdKcoLggA&edit=true).*

This example will display two clause templates:
- Jurisdiction
- Choice of Law

The `jurisdiction` clause template will display a text input for the `state` and `city` inputs, a checkbox for the `asExclusiveJurisdiction` input, and a text input for the `courtLevel` input.

The `choiceOfLaw` clause template will display a text input for the `choiceOfLaw` input, a checkbox for the `contractContainSchedules`, `contractContainExhibits`, `contractContainAppendices`, and `contractContainAttachments` inputs, and a text input for the `exclusionOfLaw` input.
