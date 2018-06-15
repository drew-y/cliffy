import { Command, Parameter } from "./definitions";

function convertToType(param: Parameter, passedVal: string): any {
    if (!param.type || param.type === "string") return passedVal;
    if (param.type === "number") return Number(passedVal);
    if (param.type instanceof Function) return param.type(passedVal);
    return Boolean(passedVal);
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
    if (command.parameters.length !== commandPieces.length) return false;
    const params: any = {};
    command.parameters.forEach(param => {
        params[param.label] = convertToType(param, commandPieces.shift()!)
    });
    return params;
}
