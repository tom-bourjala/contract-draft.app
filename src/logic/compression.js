import LZString from 'lz-string';
import elements from "ajv/lib/vocabularies/jtd/elements";

export function compressJSON(json) {
    const minimized = minimizeJSON(json);
    const string = JSON.stringify(minimized);
    const compressedLZS = LZString.compressToEncodedURIComponent(string);
    return compressedLZS;
}

export function decompressJSON(compressedLZS) {
    const string = LZString.decompressFromEncodedURIComponent(compressedLZS)
    const minimized = JSON.parse(string);
    const json = maximizeJSON(minimized);
    return json;
}



const clauseLayerMapping = {
    "clause": "c",
    "label": "l"
}

const inputLayerMapping = {
    "label": "l",
    "type": "t",
    "template": "tp",
    "mandatory": "m",
    "default": "d",
    "inactiveContent": "i",
    "activeContent": "a"
}

const inputTypeMapping = {
    "text": "t",
    "textarea": "a",
    "checkbox": "c"
}


function minimizeJSON(json) {
    const minimized = {};
    for(const key in json) {
        minimized[key] = {};
        for(const subKey in json[key]) {
            if(clauseLayerMapping[subKey]) {
                minimized[key][clauseLayerMapping[subKey]] = json[key][subKey];
            }
            else{
                const input = {};
                for(const inputKey in json[key][subKey]) {
                    if(inputKey === "type") {
                        input[inputLayerMapping[inputKey]] = inputTypeMapping[json[key][subKey][inputKey]];
                    } else {
                        input[inputLayerMapping[inputKey]] = json[key][subKey][inputKey];
                    }
                }
                minimized[key][subKey] = input;
            }
        }
    }
    return minimized;
}

function maximizeJSON(json) {
    const reversedClauseLayerMapping = {};
    for(const key in clauseLayerMapping) {
        reversedClauseLayerMapping[clauseLayerMapping[key]] = key;
    }
    const reversedInputLayerMapping = {};
    for(const key in inputLayerMapping) {
        reversedInputLayerMapping[inputLayerMapping[key]] = key;
    }
    const reversedInputTypeMapping = {};
    for(const key in inputTypeMapping) {
        reversedInputTypeMapping[inputTypeMapping[key]] = key;
    }

    const maximized = {};
    for(const key in json) {
        maximized[key] = {};
        for(const subKey in json[key]) {
            if(reversedClauseLayerMapping[subKey]) {
                maximized[key][reversedClauseLayerMapping[subKey]] = json[key][subKey];
            } else if(clauseLayerMapping[subKey]) {
                maximized[key][subKey] = json[key][subKey];
            } else {
                const input = {};
                for(const inputKey in json[key][subKey]) {
                    if(reversedInputLayerMapping[inputKey]){
                        if(inputKey === "t") {
                            input[reversedInputLayerMapping[inputKey]] = reversedInputTypeMapping[json[key][subKey][inputKey]];
                        } else {
                            input[reversedInputLayerMapping[inputKey]] = json[key][subKey][inputKey];
                        }
                    } else {
                        input[inputKey] = json[key][subKey][inputKey];
                    }
                }
                maximized[key][subKey] = input;
            }
        }
    }
    return maximized;
}