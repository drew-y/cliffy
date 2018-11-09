import readline = require("readline");
import { Command, Commands, Action } from "./definitions";
import { parseOptions } from "./option-parser";
import { printCommandHelp, printOverviewHelp } from "./help-gen";
import { findPromptedCommand } from "./command-parser";
import { parseParameters } from "./parameter-parser";

export * from "./definitions";

export class CLI {
    private readonly cmdRegistry: Commands = {};
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

    private async executeCommand(input: string): Promise<void> {
        const pieces = input.split(" ");

        if (pieces[0] === "help") return this.help(pieces.slice(1));

        const parsedCmd = findPromptedCommand(pieces, this.cmdRegistry);
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
                info: this.info, name: this.name, version: this.version, commands: this.cmdRegistry
            });
            return;
        }

        const commandOpts = findPromptedCommand(commandPieces, this.cmdRegistry);

        if (!commandOpts) return this.help([]);

        printCommandHelp(
            commandPieces.slice(0, commandPieces.length - commandOpts.remainingPieces.length).join(" "),
            commandOpts.command
        );
    }

    /** Set the cli delimiter */
    setDelimiter(delimiter: string) {
        this.delimiter = delimiter;
    }

    /** Register a command */
    command(command: string, opts: Command): void;
    command(command: string, action: Action): void;
    command(command: string, opts: Command | Action): void;
    command(command: string, opts: Command | Action): void {
        this.cmdRegistry[command] = opts;
    }

    /** Register multiple commands at once (Alias for registerCommands) */
    commands(commands: Commands) {
        for (const command in commands) {
            this.command(command, commands[command]);
        }
    }

    /** Show the CLI */
    start() {
        this.readline.resume();
        this.isActive = true;
        this.startREPL();
    }

    /** Hide the cli */
    stop() {
        this.readline.pause();
        this.isActive = false;
    }

    setVersion(val: string) {
        this.version = val;
    }

    setInfo(val: string) {
        this.info = val;
    }

    setName(val: string) {
        this.name = val;
    }

    hasCommand(cmd: string): boolean {
        return !!this.cmdRegistry[cmd];
    }
}
