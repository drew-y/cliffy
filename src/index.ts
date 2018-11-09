import readline = require("readline");
import { Command, Commands, Action, Parameter } from "./definitions";
import { parseOptions } from "./option-parser";
import { printCommandHelp, printOverviewHelp } from "./help-gen";
import { findPromptedCommand } from "./command-parser";
import { parseParameters } from "./parameter-parser";

export * from "./definitions";

export class CLI {
    private readonly commands: Commands = {};
    private readonly readline: readline.ReadLine;
    private delimiter = "$> ";
    private isActive = false;
    private name?: string;
    private info?: string;
    private version?: string;

    constructor(opts: {
        input?: NodeJS.ReadableStream,
        output?: NodeJS.WritableStream
    } = {}) {
        const input = opts.input || process.stdin;
        const output = opts.output || process.stdout;
        this.readline = readline.createInterface(input, output);
        this.readline.pause();
    }

    private paramIsRequired(param: Parameter | string) {
        return typeof param === "string" || !param.isOptional || !param.isRest;
    }

    private isRestParameter(param: Parameter | string) {
        return !(typeof param === "string") && param.isRest;
    }

    private checkCommandForErrors(command: Command | Action) {
        if (command instanceof Function) return;
        if (!command.parameters) return;

        let hasHadOptional = false;
        command.parameters.forEach((param, index, parameters) => {
            const isRequired = this.paramIsRequired(param);

            if (isRequired && hasHadOptional) {
                throw new Error(`Invalid parameter order. Required parameter after optional.`);
            }

            if (!isRequired) hasHadOptional = true;

            if (this.isRestParameter(param) && (index + 1) !== parameters.length) {
                throw new Error(`Rest parameter be last`);
            }
        });
    }

    private async executeCommand(input: string): Promise<void> {
        const pieces = input.split(" ");

        if (pieces[0] === "help") return this.help(pieces.slice(1));

        const parsedCmd = findPromptedCommand(pieces, this.commands);
        if (!parsedCmd) return this.invalidCommand();

        const options = parseOptions(parsedCmd.command, parsedCmd.remainingPieces);
        if (!options) return this.help(pieces);

        const params = parseParameters(parsedCmd.command, options.remainingPieces);
        if (!params) return this.help(pieces);

        return parsedCmd.command.action(params, options.options);
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

    private async startREPL() {
        while (this.isActive) {
            const input = await this.prompt();
            await this.executeCommand(input).catch(e => console.log(e));
        }
    }

    private help(commandPieces: string[]): void {
        if (commandPieces.length === 0) {
            printOverviewHelp({
                info: this.info, name: this.name, version: this.version, commands: this.commands
            });
            return;
        }

        const commandOpts = findPromptedCommand(commandPieces, this.commands);

        if (!commandOpts) return this.help([]);

        printCommandHelp(
            commandPieces.slice(0, commandPieces.length - commandOpts.remainingPieces.length).join(" "),
            commandOpts.command
        );
    }

    /** Set the cli delimiter */
    setDelimiter(delimiter: string): this {
        this.delimiter = delimiter;
        return this;
    }

    /** Register a command */
    addCommand(command: string, opts: Command): this;
    addCommand(command: string, action: Action): this;
    addCommand(command: string, opts: Command | Action): this;
    addCommand(command: string, opts: Command | Action): this {
        this.commands[command] = opts;
        return this;
    }

    /** Register multiple commands at once (Alias for registerCommands) */
    addCommands(commands: Commands): this {
        for (const command in commands) {
            this.checkCommandForErrors(commands[command]);
            this.addCommand(command, commands[command]);
        }
        return this;
    }

    removeCommand(command: string): this {
        delete this.commands[command];
        return this;
    }

    /** Show the CLI */
    show(): this {
        this.readline.resume();
        this.isActive = true;
        this.startREPL();
        return this;
    }

    /** Hide the cli */
    hide(): this {
        this.readline.pause();
        this.isActive = false;
        return this;
    }

    setVersion(val: string): this {
        this.version = val;
        return this;
    }

    setInfo(val: string): this {
        this.info = val;
        return this;
    }

    setName(val: string): this {
        this.name = val;
        return this;
    }

    hasCommand(cmd: string): boolean {
        return !!this.commands[cmd];
    }
}
