export interface Parameter {
    label: string;
    type?: "boolean" | "number" | "string";
    description?: string;
}

export interface Command {
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

export interface Commands { [command: string]: Command };