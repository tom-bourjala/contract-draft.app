import Ajv from 'ajv';

const schema = {
    "type": "object",
    "patternProperties": {
        "^[a-zA-Z0-9_]+$": {
            "type": "object",
            "properties": {
                "label": { "type": "string", "minLength": 1 },
                "clause": { "type": "string", "minLength": 1 },
            },
            "patternProperties": {
                "^(?!label$|clause$)[a-zA-Z0-9_]+$": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["text", "checkbox"]
                        },
                        "label": { "type": "string", "minLength": 1 },
                        "default": { "type": ["string", "boolean", "null"] },
                        "mandatory": { "type": "boolean" },
                        "inactiveContent": { "type": ["string", "null"] },
                        "activeContent": { "type": ["string", "null"] },
                        "template": { "type": "string" }
                    },
                    "additionalProperties": false,
                    "required": ["type", "label"]
                }
            },
            "additionalProperties": false,
            "required": ["label", "clause"]
        }
    },
    "additionalProperties": false
};

const ajv = new Ajv({ allErrors: true, allowMatchingProperties: true });
const ajvValidator = ajv.compile(schema);

function ajvErrorToValidationError(error) {
    return {
        path: error.instancePath.split('/').filter(item => item),
        message: error.message,
        severity: 'error'
    };
}
function customValidator(json) {
    const errors = [];

    if(Object.keys(json).length === 0) {
        errors.push({
            path: [],
            message: 'The JSON is empty, at least one clause is required.',
        });
    }

    for (let key in json) {
        const clause = json[key].clause;

        const joinRegex = /{{join\((.*?)\)}}/g;
        const joins = clause.matchAll(joinRegex);
        for (const join of joins) {
            let statement = join[1];

            try{
                const contentArg = statement.match(/\[(.*?)\]/g)[0];
                if (!contentArg) {
                    errors.push({
                        path: [key, 'clause'],
                        message: `The join statement "${join[0]}" is missing a content argument.`,
                    });
                    continue;
                }

                let content = contentArg.replaceAll(/\[|\]/g, '');
                const contentArr = content.split(',').map(item => item.trim()).filter(item => item);
                if (contentArr.length === 0) {
                    errors.push({
                        path: [key, 'clause'],
                        message: `The join statement "${join[0]}" is missing a content argument.`,
                    });
                    continue;
                }

                statement = statement.replaceAll(contentArg, '');
                let args = statement.match(/'(.*?)'|"(.*?)"|`(.*?)`/g);
                if (!args) {
                    errors.push({
                        path: [key, 'clause'],
                        message: `The join statement "${join[0]}" is missing a separator argument.`,
                    });
                    continue;
                }
                args = args.map(item => item.replaceAll(/['"`]/g, ''));
                if (args.length === 0) {
                    errors.push({
                        path: [key, 'clause'],
                        message: `The join statement "${join[0]}" has an error regarding its separator argument.`,
                    });
                    continue;
                }

                if (args.length > 3) {
                    errors.push({
                        path: [key, 'clause'],
                        message: `The join statement "${join[0]}" has an error regarding its arguments.`,
                    });
                    continue;
                }
            }
            catch(e) {
                errors.push({
                    path: [key, 'clause'],
                    message: `The join statement "${join[0]}" has an error regarding its arguments.`,
                });
                continue;
            }
        }

        const combineRegex = /{{combine\((.*?)\)}}/g;
        const combines = clause.matchAll(combineRegex);
        for (const combine of combines) {
            let statement = combine[1];

            try{
                const contentArg = statement.match(/\[(.*?)\]/g)[0];
                if (!contentArg) {
                    errors.push({
                        path: [key, 'clause'],
                        message: `The combine statement "${combine[0]}" is missing a content argument.`,
                    });
                    continue;
                }

                let content = contentArg.replaceAll(/\[|\]/g, '');
                const contentArr = content.split(',').map(item => item.trim()).filter(item => item);
                if (contentArr.length === 0) {
                    errors.push({
                        path: [key, 'clause'],
                        message: `The combine statement "${combine[0]}" is missing a content argument.`,
                    });
                    continue;
                }

                statement = statement.replaceAll(contentArg, '');
                let args = statement.match(/'(.*?)'|"(.*?)"|`(.*?)`/g);
                args = args ? args : [];
                if (args.length > 3) {
                    errors.push({
                        path: [key, 'clause'],
                        message: `The combine statement "${combine[0]}" has too many arguments.`,
                    });
                    continue;
                }
            }
            catch(e) {
                errors.push({
                    path: [key, 'clause'],
                    message: `The combine statement "${combine[0]}" has an error regarding its arguments.`,
                });
                continue;
            }
        }
    }

    return errors;
}


export function customValidation(json) {
    ajvValidator(json);
    let ajvErrors = ajvValidator.errors || [];
    ajvErrors = ajvErrors.map(ajvErrorToValidationError);
    if(ajvErrors.length) return ajvErrors;
    const customErrors = customValidator(json);
    return customErrors;
}