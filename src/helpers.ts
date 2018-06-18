import { Commands, StrictCommands, Command, Action, StrictCommand } from "./definitions";

export function commandToStrictCommand(cmd: Command | Action): StrictCommand {
    if (cmd instanceof Function) return { action: cmd };
    return {
        ...cmd,
        subcommands: cmd.subcommands ? commandsToStrictCommands(cmd.subcommands) : undefined
    };
}

export function commandsToStrictCommands(cmds: Commands): StrictCommands {
    const strictCmds: StrictCommands = {};
    for (const cmdKey in cmds) {
        const command = cmds[cmdKey];
        strictCmds[cmdKey] = commandToStrictCommand(command);
    }
    return strictCmds;
}
