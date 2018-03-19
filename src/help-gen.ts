import { Command } from "./definitions";
const indent = require("indent");
const columnify = require("columnify");

function columns(data: any) {
    return indent(columnify(data, {
        showHeaders: false,
        minWidth: 30
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
            options[`@${opt}`] = opt.description || "";
        });
        console.log(columns(options));
    }
}

function printSubCommands(val: Command) {
    if (val.subcommands) {
        console.log("Sub-Commands:\n");
        const commands: any = {};
        for (const command in val.subcommands) {
            commands[genUsage(command, val.subcommands[command])] = val.subcommands[command].description || "";
        }
        console.log(columns(commands));
    }
}

export function printOverviewHelp(opts: {
    name?: string;
    info?: string;
    version?: string;
    commands: { [command: string]: Command }
}) {
    const { name, info, commands, version } = opts;

    const commandDescriptions: any = {};
    for (const command in commands) {
        commandDescriptions[genUsage(command, commands[command])] = commands[command].description || "";
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
