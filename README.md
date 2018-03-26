# Cliffy - A Framework For Interactive CLIs

Cliffy is a simple, powerful utility for making interactive command line interfaces.
Cliffy can be considered an alternative to vorpal.

Cliffy is run as a REPL. This allows you to accept multiple commands
with one running node process. Cliffy is NOT an argv parser.

**Features**:
- REPL Style interface
- Simple API
- Can parse negative numbers
- Typed parameters
- Git Style Sub-Commands
- Options
- Auto generated help
- Typescript Support

**Gotchas**:
- Options are specified with an `@` symbol. Not `-` or `--`.
This is what allows Cliffy to parse negatives.
- Requires node v6+
- Does not yet support optional parameters
- Does not yet support rest parameters

## Quickstart

**Installation**:

```bash
npm i cliffy # --save if using npm < v5
```

**Usage**

```typescript
import { CLI } from "cliffy";

const cli = new CLI();

cli.setDelimiter("run command ->");

cli.command("say", {
    description: "Say a word",
    options: ["reversed"],
    parameters: [{ label: "word", type: "string" }],
    action: (params, options, done) => {
        if (options.reversed) {
            console.log(params.word.split("").reverse().join());
        } else {
            console.log(params.word)
        }
        done()
    }
});

cli.command("run", {
    description: "Run somewhere",
    options: [
        { option: "fast", description: "Run fast" },
        { option: "medium", description: "Run medium fast" },
        { option: "slow", description: "Run slow" }
    ],
    parameters: [{ label: "destination" }],
    action: (params, options, done) => {
        console.log(`I ran to ${params.destination}`);
        done();
    },
    subcommands: {
        to: {
            description: "Run to a destination",
            parameters: [{ label: "destination" }],
            action: (params, options, done) => {
                console.log(`I ran to ${params.destination}`);
                done();
            },
        }
        from: {
            description: "Run from a destination",
            parameters: [{ label: "destination" }],
            action: (params, options, done) => {
                console.log(`I ran to ${params.destination}`);
                done();
            },
        }
    }
});

cli.show();
```

Result:

```bash
$> say hello
hello
$> say @reversed hello
olleh
$> run to nevada
I ran to nevada
$> help

Available commands:

    say [options] <word>             Say a word
    run [options]                    Run somewhere

$> help run

Run somewhere

Usage:

    run [options] <destination>

Options:

   @fast                             Run fast
   @medium                           Run medium fast
   @slow                             Run slow

Sub-Commands:

    to [options] <destination>       Run to a destination
    from [options] <destination>     Run from a destination
```

## API

### `new CLI()`

Interface:
```typescript
class CLI {
    constructor(opts: {
        input?: ReadStream,
        output?: WriteStream
    } = {})
}
```

Usage:

```typescript
const cli = new CLI(opts)
```

### `cli.command(name: string, opts: Command): void`

Register a command

A command takes a name and an opts object.

The command name is what the user will enter to execute the command.

The command opts follows the following interface:
```typescript
interface Command {
    /**
     * Required action function. Executed when the user enters the command.
     *
     * parameters is a key value store. Where the key is the parameter label,
     * and the value is the value entered by the user.
     *
     * options is a key value store. Key being the option, value being true if the user
     * specified the option, false otherwise.
     *
     * done is a function to be called inside the action function when the function is complete.
     * As an alternative to calling done, the action may also return a Promise which ends the
     * action when resolved.
     */
    action: (parameters: any, options: any, done: () => void) => void | Promise<any>;

    /** Optional description for documentation */
    description?: string;

    /** An array of options available to the user. The user specifies an option with an @ symbol i.e. @force */
    options?: ({
        option: string;
        description?: string;
    } | string)[];

    /** All the parameters available to the user. See the parameters interface */
    parameters?: Parameter[],

    /** Sub commands of the command. Follows the same interface as Command */
    subcommands?: { [command: string]: Command },
}

interface Parameter {
    label: string;
    type?: "boolean" | "number" | "string";
    description?: string;
}
```

Example Usage:

```typescript
cli.command("run", {
    description: "Run somewhere",
    options: [
        { option: "fast", description: "Run fast" },
        { option: "medium", description: "Run medium fast" },
        { option: "slow", description: "Run slow" }
    ],
    parameters: [{ label: "destination" }],
    action: (params, options, done) => {
        console.log(`I ran to ${params.destination}`);
        done();
    },
    subcommands: {
        to: {
            description: "Run to a destination",
            parameters: [{ label: "destination" }],
            action: (params, options, done) => {
                console.log(`I ran to ${params.destination}`);
                done();
            },
        }
        from: {
            description: "Run from a destination",
            parameters: [{ label: "destination" }],
            action: (params, options, done) => {
                console.log(`I ran to ${params.destination}`);
                done();
            },
        }
    }
});
```

### `cli.registerCommands(commands: { [name: string]: Command })`

Register multiple commands at once.

Example usage:

```typescript
cli.registerCommands({
    run: {
        action(params, options, done) {
            console.log("Running");
            done();
        }
    },

    jog: {
        action(params, options, done) {
            console.log("Jogging");
            done();
        }
    },

    walk: {
        action(params, options, done) {
            console.log("Walking");
            done();
        }
    }
});
```

### `cli.setDelimiter(delimiter: string)`

Set the CLI delimiter

Defaults to: `"$>"`

### `cli.setInfo(info: string)`

Set the CLI info.

Info is meant to give an overview of what the CLI does and how to use it.
If it is set it is shown directly under the CLI name.

Defaults to: `none`

### `cli.setName(name: string)`

Set the name of the CLI (Shown at the top of the help menu)

Defaults to: `none`

### `cli.setVersion(version: string)`

Set the CLI version. Shown beside the CLI name if set.

Defaults to: `none`

### `cli.show()`

Show the CLI

### `cli.hide()`

Hide the cli

## Autogenerated Help Menu

Cliffy automatically generates a help menu for each command.

To get an overview of all the commands simply type:

```
help
```

To get help with a specific command, type help followed by the command.

```
help ls
```

This works with subcommands as well

```
help git pull
```

## Build instructions

1. Clone this repo
2. CD into the repo
3. `npm install`
4. `npm run build`