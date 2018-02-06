import { CLI } from "./index";

const cli = new CLI();

cli.setDelimiter("example -> ")

cli.command("hello", {
    action: (params, opts, done) => {
        console.log("Hello Back!");
        done();
    }
});

cli.command("hide", {
    action() {
        cli.hide();
        setTimeout(() => {
            cli.show();
        }, 2000);
        return Promise.resolve();
    }
});

cli.command("do", {
    description: "Preform an action",
    action: (a, b, c) => c(),
    subcommands: {
        something: {
            options: [
                "joint",
                "hi"
            ],
            parameters: [
                { label: "num", type: "number" }
            ],
            action: (a, b, c) => {
                console.log(`I Did Something!`);
                console.log(a);
                console.log(b);
                c();
            }
        },
        nothing: {
            action: (a, b, c) => {
                console.log(`I Did Nothing!`);
                c();
            }
        }
    }
});

cli.show();
