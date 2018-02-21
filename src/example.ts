import { CLI } from "./index";
const { log } = console;

const cli = new CLI()
    .setDelimiter("example -> ")
    .addExitCommand()
    .addCommand("hello", {
        action(parameters, options) {
            log("Hello Back!");
        },
    })
    .addCommand("hide", {
        action(parameters, options) {
            cli.hide();
            setTimeout(() => {
                cli.show();
            }, 2000);
            return Promise.resolve();
        },
    })
    .addCommand("do", {
        description: "Preform an action",
        action: (parameters, options) => null,
        subcommands: {
            something: {
                options: [
                    "joint",
                    "hi",
                ],
                parameters: [
                    { label: "num", type: "number" },
                ],
                action(parameters, options) {
                    log("I Did Something!");
                    log(parameters.rer);
                    log(options);
                },
            },
            nothing: {
                action(parameters, options) {
                    log("I Did Nothing!");
                },
            },
        },
    })
    .show();
