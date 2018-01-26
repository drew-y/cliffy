export interface Parameter {
    label: string;
    type?: "boolean" | "number" | "string";
    description?: string;
}

export interface Command {
    description?: string;
    options?: ({
        option: string;
        description?: string;
    } | string)[];
    parameters?: Parameter[],
    action: (parameters: any, options: any, done: () => void) => void | Promise<any>;
    subcommands?: { [command: string]: Command },
}