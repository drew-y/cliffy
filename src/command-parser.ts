import { Commands, Command, Action } from "./definitions";

export type CommandAndPieces = { command: Command, remainingPieces: string[] };

const actionToCommand = (action: Action): Command => ({ action });

/**
 * Return the Command object the command string specifies.
 * Returns false if the command string did not have a valid command;
 * @param promptResponse
 */
export function findPromptedCommand(promptResponse: string[], commands: Commands): CommandAndPieces | false {
    const command = commands[promptResponse[0]];

    if (!command) return false;

    if (command instanceof Function) {
        return {
            command: actionToCommand(command),
            remainingPieces: promptResponse.slice(1)
        };
    }

    if (command.subcommands) {
        const subcommand = findPromptedCommand(promptResponse.slice(1), command.subcommands);
        if (subcommand) return subcommand;
    }

    return { command, remainingPieces: promptResponse.slice(1) };
}
