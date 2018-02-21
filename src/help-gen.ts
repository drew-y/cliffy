import { Command } from "./definitions";
const indent = require("indent");
const columnify = require("columnify");
const { log } = console;

function columns(data: any) {
    return indent(columnify(data, {
        showHeaders: false,
        minWidth: 30,
    }), 4);
}

function genUsage(command: string, val: Command) {
    let usage = `${command} [options]`;
    if (!val.parameters) return usage;
    for (const param of val.parameters) {
        usage += ` <${param.label}>`;
    }
    return usage;
}

export function printCommandHelp(command: string, val: Command) {
    log("");
    if (val.description) {
        log(val.description + "\n");
    }
    log("Usage:\n");
    log(indent(genUsage(command, val), 4) + "\n");
    printOptions(val);
    printSubCommands(val);
    log("");
}

function printOptions(val: Command) {
    if (val.options && val.options.length > 0) {
        log("Options:\n");
        const options: any = {};
        val.options.forEach((opt) => {
            if (typeof opt === "string") {
                options[`@${opt}`] = "";
                return;
            }
            options[`@${opt}`] = opt.description || "";
        });
        log(columns(options));
    }
}

function printSubCommands(val: Command) {
    if (val.subcommands) {
        log("Sub-Commands:\n");
        const commands: any = {};
        for (const command in val.subcommands) {
            if (val.subcommands.hasOwnProperty(command)) {
                commands[genUsage(command, val.subcommands[command])] = val.subcommands[command].description || "";
            }
        }
        log(columns(commands));
    }
}

export function printOverviewHelp(commands: { [command: string]: Command }) {
    const commandDescriptions: any = {};
    for (const command in commands) {
        if (commands.hasOwnProperty(command)) {
            commandDescriptions[genUsage(command, commands[command])] = commands[command].description || "";
        }
    }
    log("\nUsage:\n");
    log(indent("<cmd>\n", 4));

    log("Available commands:\n");
    log(indent("help <cmd>", 4));

    log(columns(commandDescriptions) + "\n");
    return;
}
