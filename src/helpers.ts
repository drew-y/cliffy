import { Command, Action } from ".";
import { Commands } from "./definitions";

/** Registers the aliases of a command into a dictionary of commands */
export function registerCommandAliases({ name, command, commands }: {
    name: string,
    command: Command | Action,
    commands: Commands
}) {
    if (command instanceof Function || !command.aliases) return;

    command.aliases.forEach(alias => {
        if (commands[alias]) {
            const msg = `Could not create alias ${alias} for ${name}. ${alias} was already taken`;
            throw new Error(msg);
        }

        commands[alias] = command;
    });

    // Setup aliases for subcommands as well.
    if (!command.subcommands) return;
    for (const commandName in command.subcommands) {
        registerCommandAliases({
            name: commandName,
            command: command.subcommands[commandName],
            commands: command.subcommands
        });
    }
}
