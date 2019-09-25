import readline = require("readline");
import { Command, Commands, Action, Parameter } from "./definitions";
import { parseOptions } from "./option-parser";
import { printCommandHelp, printOverviewHelp } from "./help-gen";
import { findPromptedCommand } from "./command-parser";
import { parseParameters } from "./parameter-parser";
import { registerCommandAliases } from "./helpers";

export * from "./definitions";

export class CLI {
    private readonly cmds: Commands = {};
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
        if (typeof param === "string") return true;
        return !param.optional && !param.rest;
    }

    private isRestParameter(param: Parameter | string) {
        return !(typeof param === "string") && param.rest;
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
        const parts = input.match(/\w+|"[^"]+"/g) || [];
        const pieces = parts.map(word=>word.replace(/^"(.+(?="$))"$/, '$1'));

        if (pieces[0] === "help") return this.help(pieces.slice(1));

        const parsedCmd = findPromptedCommand(pieces, this.cmds);
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
                info: this.info, name: this.name, version: this.version, commands: this.cmds
            });
            return;
        }

        const commandOpts = findPromptedCommand(commandPieces, this.cmds);

        if (!commandOpts) return this.help([]);

        printCommandHelp(
            commandPieces.slice(0, commandPieces.length - commandOpts.remainingPieces.length).join(" "),
            commandOpts.command
        );
    }

    private removeCommandAliases(commandName: string) {
        const command = this.cmds[commandName];
        if (!command || command instanceof Function || !command.aliases) return;
        command.aliases.forEach(alias => delete this.cmds[alias]);
    }

    /** Set the cli delimiter */
    setDelimiter(delimiter: string): this {
        this.delimiter = delimiter;
        return this;
    }

    /** Register a command */
    addCommand(name: string, command: Command): this;
    addCommand(name: string, action: Action): this;
    addCommand(name: string, command: Command | Action): this;
    addCommand(name: string, command: Command | Action): this {
        this.checkCommandForErrors(command);
        this.cmds[name] = command;
        registerCommandAliases({ name, command, commands: this.cmds });
        return this;
    }

    /** Register multiple commands at once (Alias for registerCommands) */
    addCommands(commands: Commands): this {
        for (const command in commands) {
            this.addCommand(command, commands[command]);
        }
        return this;
    }

    removeCommand(command: string): this {
        this.removeCommandAliases(command);
        delete this.cmds[command];
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
        return !!this.cmds[cmd];
    }

    /**
     * Register a command.
     *
     * @deprecated - Use addCommand instead.
     */
    command(name: string, opts: Command | Action): this {
        console.warn("command is deprecated - use addCommand instead");
        return this.addCommand(name, opts);
    }

    /**
     * Register multiple commands at once (Alias for registerCommands).
     *
     * @deprecated - Use addCommands instead.
     **/
    commands(name: Commands): this {
        console.warn("commands is deprecated - use addCommands instead");
        return this.addCommands(name);
    }

    /**
     * Register multiple commands at once (Alias for registerCommands).
     *
     * @deprecated - Use addCommands instead.
     **/
    registerCommands(name: Commands): this {
        console.warn("registerCommands is deprecated - use addCommands instead");
        return this.registerCommands(name);
    }
}
