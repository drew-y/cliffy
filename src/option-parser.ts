import { Command } from "./definitions";

export type ParsedOptions = { options: any, remainingPieces: string[] };

/**
 * Returns an object with any options that were in the command set to true,
 * all others set to false.
 *
 * Returns false if an invalid option was detected
 * @param commandPieces
 */
export function parseOptions(command: Command, commandPieces: string[]): ParsedOptions | false {
    const options: any = {};

    const { foundOptions, remainingPieces } = removeOptionsFromCommandPieces(commandPieces);

    // Options were found when no options were registered
    if (!command.options && foundOptions.length > 0) return false;

    // Options are empty
    if (!command.options) return { options, remainingPieces: commandPieces };

    populateOptionsObject(command, options);

    const hadInvalidOption = matchOptionsUsedInCommandStr(foundOptions, options);

    if (hadInvalidOption) return false;

    return { options, remainingPieces };
}

function matchOptionsUsedInCommandStr(foundOptions: string[], options: any) {
    let hadInvalidOption = false;
    foundOptions.forEach(opt => {
        // Make sure the options is registered with the command before we set it
        if (options[opt] === undefined) {
            hadInvalidOption = true;
        }

        options[opt] = true;
    });
    return hadInvalidOption;
}

function populateOptionsObject(command: Command, options: any) {
    if (!command.options) throw new Error("No options to populate");
    command.options.forEach(opt => {
        if (typeof opt === "string") {
            options[opt] = false;
            return;
        }
        options[opt.option] = false;
    });
}

function removeOptionsFromCommandPieces(commandPieces: string[]) {
    const remainingPieces = commandPieces.slice();
    const foundOptions: string[] = [];
    commandPieces.forEach(piece => {
        if (piece[0] === "@") {
            foundOptions.push(piece.substring(1));
        }
    });
    // Remove options from the commandPieces
    foundOptions.forEach(opt => {
        const index = remainingPieces.indexOf(`@${opt}`);
        remainingPieces.splice(index, 1);
    });
    return { foundOptions, remainingPieces };
}
