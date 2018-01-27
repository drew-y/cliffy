import readline = require("readline");
import { ReadStream } from "fs";
import { WriteStream } from "tty";
import { Command, Parameter } from "./definitions";
import { parseOptions } from "./option-parser";
import { printCommandHelp, printOverviewHelp } from "./help-gen";

const columnify = require("columnify");

export class CLI {
    private readonly commands: { [command: string]: Command } = {};
    private readonly readline: readline.ReadLine;
    private delimiter = "$> ";
    private isActive = false;

    constructor(opts: {
        input?: ReadStream,
        output?: WriteStream
    } = {}) {
        const input = opts.input || process.stdin;
        const output = opts.output || process.stdout;
        this.readline = readline.createInterface(input, output);
    }

    /**
     * Returns an object with any options that were in the command set to true,
     * all others set to false.
     *
     * Returns false if an invalid option was detected
     * @param commandPieces
     */
    private parseOptions(command: Command, commandPieces: string[]): { options: any, remainingPieces: string[] } | false {
        return parseOptions(command, commandPieces);
    }

    /**
     * Return the Command object the command string specifies.
     * Returns false if the command string did not have a valid command;
     * @param commandPieces
     */
    private getCommand(
        commandPieces: string[], commands?: { [command: string]: Command }
    ): { command: Command, remainingPieces: string[] } | false {
        // Get command from the commands parameter or the CLI.commands object if commands was not specified
        let command = commands ? commands[commandPieces[0]] : this.commands[commandPieces[0]];

        if (!command) return false;

        if (command.subcommands) {
            const subcommand = this.getCommand(commandPieces.slice(1), command.subcommands);
            if (subcommand) {
                return subcommand;
            }
        }

        return {
            command, remainingPieces: commandPieces.slice(1)
        }
    }

    /**
     * Get the parameters object from the remainingPieces of the command string.
     *
     * Command pieces should only have remaining parameters at the point that
     * this function is called.
     * @param command
     * @param commandPieces
     */
    private parseParameters(command: Command, commandPieces: string[]): any | false {
        if (!command.parameters && (commandPieces.length > 0)) return false;
        if (!command.parameters) return {};
        if (command.parameters.length !== commandPieces.length) return false;
        const params: any = {};
        command.parameters.forEach(param => {
            if (!param.type || param.type === "string") {
                params[param.label] = commandPieces.shift();
                return;
            }

            if (param.type === "number") {
                params[param.label] = Number(commandPieces.shift());
                return;
            }

            params[param.label] = Boolean(commandPieces.shift());
        });
        return params;
    }

    private async executeCommand(commandStr: string) {
        const pieces = commandStr.split(" ");
        if (pieces[0] === "help") return this.help(pieces.slice(1));
        const command = this.getCommand(pieces);
        if (!command) return this.invalidCommand();
        const options = this.parseOptions(command.command, command.remainingPieces);
        if (!options) return this.invalidCommand();
        const params = this.parseParameters(command.command, options.remainingPieces);
        if (!params) return this.invalidCommand();
        return new Promise(resolve => {
            const prom = command.command.action(params, options.options, resolve);
            if (prom instanceof Promise) {
                prom.then(resolve).catch(e => {
                    console.log(e);
                    resolve()
                });
            }
        });
    }

    private invalidCommand() {
        console.log(`Invalid Command`);
        this.help([]);
    }

    private async prompt(): Promise<string> {
        return new Promise<string>(resolve => {
            this.readline.question(this.delimiter, resolve);
        });
    }

    private help(commandPieces: string[]): void {
        if (commandPieces.length === 0) {
            printOverviewHelp(this.commands);
            return;
        }

        const commandOpts = this.getCommand(commandPieces);
        if (!commandOpts) return this.help([]);
        printCommandHelp(commandPieces.join(" "), commandOpts.command);
    }

    setDelimiter(delimiter: string) {
        this.delimiter = delimiter;
    }

    command(command: string, opts: Command) {
        this.commands[command] = opts;
    }

    async show() {
        this.isActive = true;
        while (this.isActive) {
            const commandStr = await this.prompt();
            await this.executeCommand(commandStr);
        }
    }

    hide() {
        this.isActive = false;
    }
}