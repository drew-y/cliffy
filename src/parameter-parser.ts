import { Command, Parameter } from "./definitions";

function convertToType(param: Parameter, passedVal: string | undefined): any {
    if (passedVal === undefined) return undefined;
    if (!param.type || param.type === "string") return passedVal;
    if (param.type === "number") return Number(passedVal);
    if (param.type instanceof Function) return param.type(passedVal);
    return passedVal !== "false" && passedVal !== "False";
}

function requiredParameterCount(parameters: (Parameter | string)[]) {
    let count = 0;
    for (const param of parameters) {
        if (typeof param === "string") {
            count += 1;
            continue;
        }

        if (param.optional || param.rest) continue;
        count += 1;
    }
    return count;
}

function optionalParameterCount(parameters: (Parameter | string)[]) {
    let count = 0;
    for (const param of parameters) {
        if (typeof param === "string") continue;
        if (param.optional || param.rest) count += 1;
    }
    return count;
}

function hasRestParam(parameters: (Parameter | string)[]) {
    const lastParam = parameters[parameters.length - 1];
    if (!lastParam || typeof lastParam === "string") return false;
    return !!lastParam.rest;
}

/**
 * Get the parameters object from the remainingPieces of the command string.
 *
 * Command pieces should only have remaining parameters at the point that
 * this function is called.
 * @param command
 * @param commandPieces
 */
export function parseParameters(command: Command, commandPieces: string[]): any | false {
    if (!command.parameters && (commandPieces.length > 0)) return false;
    if (!command.parameters) return {};

    // Ensure the user passed all required parameters.
    const requiredCount = requiredParameterCount(command.parameters);
    if (commandPieces.length < requiredCount) return false;

    // Ensure the user did not provide extra parameters.
    const totalParameters = requiredCount + optionalParameterCount(command.parameters);
    if (commandPieces.length > totalParameters && !hasRestParam(command.parameters)) {
        return false;
    }

    const params: any = {};

    for (const param of command.parameters) {
        if (typeof param === "string") {
            params[param] = commandPieces.shift();
            continue;
        }

        if (param.rest) {
            params[param.label] = commandPieces
                .map(item => convertToType(param, item));
            break;
        }

        params[param.label] = convertToType(param, commandPieces.shift());
    }

    return params;
}
