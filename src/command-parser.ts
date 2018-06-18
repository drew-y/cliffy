import { Command, StrictCommands } from "./definitions";


/**
 * Return the Command object the command string specifies.
 * Returns false if the command string did not have a valid command;
 * @param promptResponse
 */
export function parseCommand(promptResponse: string[], commands: StrictCommands): (
    { command: Command, remainingPieces: string[] } | false
) {
   const command = commands[promptResponse[0]];

   if (!command) return false;

   if (command.subcommands) {
       const subcommand = parseCommand(promptResponse.slice(1), command.subcommands);
       if (subcommand) return subcommand;
   }

   return { command, remainingPieces: promptResponse.slice(1) };
}
