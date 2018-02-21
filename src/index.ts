import * as readline from "readline";
import { ReadStream } from "fs";
import { WriteStream } from "tty";
import { Command } from "./definitions";
import { parseOptions } from "./option-parser";
import { printCommandHelp, printOverviewHelp } from "./help-gen";
import { parseCommand } from "./command-parser";
import { parseParameters } from "./parameter-parser";

export class CLI {
    /**
     * All commands
     */
    private readonly commands: { [command: string]: Command } = {};
    /**
     * Readline interface
     * *
     * @type {ReadLine}
     */
    private readonly readline: readline.ReadLine;
    /**
     * Example: "-> "
     * *
     * @type {string}
     */
    private delimiter: string = "->";
    /**
     * Active or hidden
     * *
     * @type {boolean}
     */
    private isActive: boolean = false;
    /**
     *
     * @param opts
     */
    public constructor(opts: {
        input?: ReadStream,
        output?: WriteStream,
    } = {}) {
        const input = opts.input || process.stdin;
        const output = opts.output || process.stdout;
        this.readline = readline.createInterface(input, output);
        this.readline.pause();
    }

    /**
     * Execute command
     * *
     * @param {string} commandStr
     * *
     * @return {Promise<any>}
     */
    private async executeCommand(commandStr: string): Promise<any> {
        const pieces = commandStr.split(" ");
        if (pieces[0] === "help") return this.help(pieces.slice(1));
        const command = parseCommand(pieces, this.commands);
        if (!command) return this.invalidCommand();
        const options = parseOptions(command.command, command.remainingPieces);
        if (!options) return this.help(pieces);
        const params = parseParameters(command.command, options.remainingPieces);
        if (!params) return this.help(pieces);

        return new Promise((resolve) => {
            const prom = command.command.action(params, options.options, resolve);
            if (prom instanceof Promise) {
                prom.then(resolve).catch((e) => {
                    console.log(e);
                    resolve();
                });
            }
        });
    }

    /**
     * Invalid command
     */
    private invalidCommand(): void {
        console.log("Invalid Command");
        this.help([]);
    }

    /**
     * Handle user console input
     * *
     * @return {Promise<string>} - User input
     */
    private prompt = (): Promise<string> =>
        new Promise<string>((resolve) => this.readline.question(`${this.delimiter} `, resolve))

    /**
     * Start REPL
     * *
     * @return {Promise<boolean>} - Is active
     */
    private async startREPL(): Promise<boolean> {
        try {
            const commandStr = await this.prompt();
            await this.executeCommand(commandStr);
            if (this.isActive) this.startREPL();
        } catch (error) {
            console.log(error);
        }

        return this.isActive;
    }

    /**
     * Show help
     * *
     * @param {string[]} commandPieces
     */
    private help(commandPieces: string[]): void {
        if (commandPieces.length === 0) {
            printOverviewHelp(this.commands);
            return;
        }

        const commandOpts = parseCommand(commandPieces, this.commands);

        if (!commandOpts) return this.help([]);

        printCommandHelp(
            commandPieces.slice(0, commandPieces.length - commandOpts.remainingPieces.length).join(" "),
            commandOpts.command,
        );
    }

    /**
     * Set the cli delimiter
     * *
     * @param {string} [delimiter] - Example: "->"
     * *
     * @return {CLI}
     */
    public setDelimiter(delimiter: string): this {
        this.delimiter = delimiter;
        return this;
    }

    /**
     * Get cli delimiter
     * *
     * @return {string}
     */
    public getDelimiter = (): string => this.delimiter;

    /**
     * Register a command
     * *
     * @param {string} [name] - Example: hello-world
     * @param {Command} [command]
     * *
     * @return {CLI}
     */
    public addCommand(name: string, command: Command): this {
        this.commands[name] = command;
        return this;
    }

    /**
     * Multiple commands register
     * *
     * @param {Array<{name: string, command: Command}>} commands
     * *
     * @return {CLI}
     */
    public addCommands(commands: Array<{name: string, command: Command}>): this {
        commands.forEach(({ name, command }) => {
            this.commands[name] = command;
        });
        return this;
    }

    /**
     * Register a command
     * TODO: Remove there methode, please use "addCommand"
     * *
     * @param {string} [name] - Example: hello-world
     * @param {Command} [command]
     * *
     * @deprecated - Use "addCommand"
     * @todo - Remove method
     * *
     * @return {CLI}
     */
    public command(name: string, command: Command): this {
        console.warn('"command" deprecated, use "addCommand"');
        return this.addCommand(name, command);
    }

    /**
     * Unregister command
     * *
     * @param {string} [name] - Example: hello-world
     * *
     * @return {CLI}
     */
    public removeCommand(name: string): this {
        delete this.commands[name];
        return this;
    }

    /**
     * Unregister all commands
     * *
     * @return {CLI}
     */
    public removeAllCommands(): this {
        for (const name in this.commands) {
            if (this.commands.hasOwnProperty(name)) {
                delete this.commands[name];
            }
        }
        return this;
    }

    /**
     * Simple exit command
     * *
     * @param {string} [name] - Exit command (Default "exit")
     * *
     * @return {CLI}
     */
    public addExitCommand(name: string = "exit"): this {
        this.commands[name] = {
            action: () => process.exit(),
        };
        return this;
    }

    /**
     * Commands count
     * *
     * @return {number}
     */
    public getCommandsCount = (): number => Object.keys(this.commands).length;

    /**
     * Show the CLI
     * *
     * @return {CLI}
     */
    public show(): this {
        this.readline.resume();
        this.isActive = true;
        this.startREPL();
        return this;
    }

    /**
     * Hide the cli
     * *
     * @return {CLI}
     */
    public hide(): this {
        this.readline.pause();
        this.isActive = false;
        return this;
    }
}
