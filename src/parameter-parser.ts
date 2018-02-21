import { Command } from "./definitions";

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
    command.parameters.forEach((param) => {
        if (!param.type || param.type === "string") {
            params[param.label] = commandPieces.shift();
            return false;
        }

        if (param.type === "number") {
            params[param.label] = Number(commandPieces.shift());
            return false;
        }

        params[param.label] = Boolean(commandPieces.shift());
    });
    return params;
}
