# Cliffy - A Framework For Interactive CLIs

Cliffy is a simple, powerful utility for making interactive command line interfaces.
Cliffy can be considered an alternative to vorpal.

**Features**:
- Simple API
- Can parse negative numbers
- Typed parameters
- Git Style Sub-Commands
- Options

**Gotchas**
- Options are specified with an `@` symbol. Not `-` or `--`.
This is what allows Cliffy to parse negatives.

## Example Cliffy CLI

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

$> run help

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

## Quickstart

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

### `cli.command`

Register a command

Interface:

```typescript
command(command: string, opts: Command): void
```

Usage:

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

### `cli.setDelimiter`

Set the CLI delimiter

Interface:

```typescript
setDelimiter(delimiter: string)
```

### `cli.show`

Show the CLI

```typescript
show()
```

### `cli.hide`

Hide the cli

```typescript
hide()
```

### `Command`

```typescript
interface Command {
    description?: string;
    options?: ({
        option: string;
        description?: string;
    } | string)[];
    parameters?: Parameter[],
    action: (parameters: any, options: any, done: () => void) => void | Promise<any>;
    subcommands?: { [command: string]: Command },
}
```

### `Parameter`

```typescript
interface Parameter {
    label: string;
    type?: "boolean" | "number" | "string";
    description?: string;
}
```

