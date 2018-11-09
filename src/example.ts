import { CLI } from "./index";

const cli = new CLI();

cli
    .setName("Cliffy Example CLI")
    .setVersion("2.0.0")
    .setInfo("This is an example CLI. Made with Cliffy")
    .setDelimiter("server console -> ")
    .addCommand("add", {
        description: "Add something to the server database",
        action() { console.log("See 'help add'"); },
        subcommands: {
            user: {
                description: "Add a user to the database",
                parameters: [{ label: "name", description: "Name of the user to add" }],
                options: [{ label: "admin", description: "The user is an admin" }],
                action(params, options) {
                    if (options.admin) {
                        console.log(`Admin user ${params.name} added`);
                        return;
                    }

                    console.log(`User ${params.name} added`);
                    return;
                }
            },

            group: {
                description: "Add a group to the database",
                parameters: [{ label: "name", description: "Name of the group to add" }],
                action(params) {
                    console.log(`Group ${params.name} added`);
                    return;
                }
            }
        }
    })
    .addCommand("start", {
        description: "Start the server",
        action() {
            console.log("Server started!");
        }
    })
    .addCommand("stop", {
        description: "Stop the server",
        action() {
            console.log("Server stopped!");
        }
    })
    .addCommand("bind", {
        description: "Bind the server to a new address",
        parameters: [{ label: "address", description: "The address to bind to" }],
        action(params) {
            console.log(`Server bound to ${params.address}`);
        }
    })
    .show();
