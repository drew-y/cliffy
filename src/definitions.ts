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
export interface Action {
    (parameters: any, options: PassedOptions): void | Promise<void>;
}

export interface PassedOptions {
    [key: string]: boolean;
}

export interface Parameter {
    label: string;
    /** The type to convert the provided value to. Can be a custom converter. */
    type?: "boolean" | "number" | "string" | ((val: string) => any);
    isOptional?: boolean;
    isRest?: boolean;
    description?: string;
}

export interface Option {
    label: string;
    description?: string;
}

export interface Command {
    action: Action;

    /** Optional description for documentation */
    description?: string;

    /**
     * An array of options available to the user.
     * The user specifies an option with an @ symbol i.e. @force
     */
    options?: (Option | string)[];

    /**
     * All the parameters available to the user.
     * See the parameters interface.
     *
     * If a string is passed it is assumed to be string parameter
     */
    parameters?: (Parameter | string)[];

    /** Sub commands of the command. Follows the same interface as Command */
    subcommands?: Commands;
}

export interface Commands {
    [command: string]: Command | Action;
}
