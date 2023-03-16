# Contract Drafter Documentation

## About

Contract Drafter is a web app that allows users to customize contract clauses based on a contract template. It is built with Vue.js and Tailwind CSS.

## How to Use Contract Drafter Web App

1. Visit [contract-drafter.com](https://contract-drafter.com).
2. Click on the "Load Template" button to open a modal with a textarea.
3. Paste your template JSON file in the textarea and click on the "Load Template" button within the modal.
4. The app will display two sides:
    - **Left side**: A list of inputs to customize the contract clauses.
    - **Right side**: The resulting contract clauses based on the provided input.
5. Fill in the inputs.
6. Click on the top right button to copy the resulting contract content to your clipboard.
## Constructing a Contract Template

A contract template is a JSON object where each key represents a clause or a section of the contract. Each key has an associated JSON object that contains information about the clause, input fields, and formatting options. The general structure of a clause object looks like this:

```json
{
  "label": "Label for the clause",
  "input1": { ... },
  "input2": { ... },
  ...
  "clause": "The text of the clause with placeholders for input values, like {{input1}}, {{input2}}, ...",
}
```

### Clauses

A clause is a part of the contract template that represents a paragraph or a section of the contract. It contains the text of the clause with placeholders for input values, which will be replaced with the actual input values when the contract is generated.

### Inputs

Inputs are the fields that allow users to customize the contract clauses. Each input has a unique key within the clause object and an associated JSON object that contains information about the input field, its type, label, and other attributes.

#### Input Types

There are four input types:

1. **Text**: A simple text input field.
2. **Checkbox**: A binary choice represented by a checkbox.
3. **Select**: A dropdown list of options.
4. **Date**: A date picker for selecting a date.

#### Input Attributes

| Attribute         | Type    | Description                                                                                                           | Mandatory | Default   |
|-------------------|---------|-----------------------------------------------------------------------------------------------------------------------|-----------|-----------|
| label             | String  | The label for the input field.                                                                                        | Yes       | N/A       |
| type              | String  | The input type (text, checkbox, select, date).                                                                        | Yes       | N/A       |
| default           | Various | The default value for the input field.                                                                                | No        | `null`    |
| mandatory         | Boolean | Whether the input field is mandatory (if the input of a mandatory text is empty, the text displayed will be default). | No        | `false`   |
| activeContent     | String  | Content to use when the checkbox is checked (only applicable for checkbox type).                                      | No        | N/A       |
| inactiveContent   | String  | Content to use when the checkbox is unchecked (only applicable for checkbox type).                                    | No        | N/A       |
| template          | String  | A string with placeholders to be replaced by the value of another input (only applicable for text type).              | No        | N/A       |
| options           | Array   | An array of options for the select input type.                                                                        | No        | N/A       |

### Functions

Functions are used to manipulate input values within a clause. Currently, there is one function available: `join`.

#### Join

The `join` function is used to join an array of input values with a specified delimiter. It takes three arguments:
 
- An array of input keys.
- The delimiter to be used for joining the values.
- A facultative prefix to be added before the joined values.
- A facultative suffix to be added after the joined values.

```
join([input1, input2, ...], "delimiter", "prefix", "suffix")
```

Example:

```json
{
   "includes":{
      ...
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

Example:

```json
{
   "includes":{
      ...
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
## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
