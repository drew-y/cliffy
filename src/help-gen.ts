import { Command, Action, Commands } from "./definitions";

const indent = require("indent");
const columnify = require("columnify");

function columns(data: any) {
    return indent(columnify(data, {
        showHeaders: false,
        minWidth: 30
    }), 4);
}

function genUsage(command: string, val: Command | Action) {
    let usage = `${command} [options]`;
    if (val instanceof Function || !val.parameters) return usage;
    for (const param of val.parameters) {
        const label = typeof param === "string" ? param : param.label;
        usage += ` <${label}>`;
    }
    return usage;
}

export function printCommandHelp(command: string, val: Command) {
    console.log("");
    if (val.description) {
        console.log(`${val.description}\n`);
    }
    console.log(`Usage:\n`);
    console.log(`${indent(genUsage(command, val), 4)}\n`);
    printOptions(val);
    printSubCommands(val);
    console.log("");
}

function printOptions(val: Command) {
    if (val.options && val.options.length > 0) {
        console.log(`Options:\n`);
        const options: any = {};
        val.options.forEach(opt => {
            if (typeof opt === "string") {
                options[`@${opt}`] = "";
                return;
            }

            options[`@${opt.label}`] = opt.description || "";
        });
        console.log(columns(options));
    }
}

function commandDescription(command: Command | Action): string {
    if (command instanceof Function) return "";
    return command.description || "";
}

function printSubCommands(val: Command) {
    if (val.subcommands) {
        console.log("Sub-Commands:\n");
        const commands: any = {};
        for (const command in val.subcommands) {
            commands[genUsage(command, val.subcommands[command])] = commandDescription(val.subcommands[command]);
        }
        console.log(columns(commands));
    }
}

export function printOverviewHelp(opts: {
    name?: string;
    info?: string;
    version?: string;
    commands: Commands
}) {
    const { name, info, commands, version } = opts;

    const commandDescriptions: any = {};
    for (const command in commands) {
        commandDescriptions[genUsage(command, commands[command])] = commandDescription(commands[command]);
    }

    if (name) {
        const title = `${name} ${version ? `- ${version}` : ""}`;
        console.log(`\n${title}`);
    }

    if (info) console.log(`\n${info}`);

    console.log(`\nUsage:\n`);
    console.log(indent(`<cmd>\n`, 4));

    console.log(`Available commands:\n`);
    console.log(indent(`help <cmd>`, 4));

    console.log(`${columns(commandDescriptions)}\n`);
    return;
}
