import { CLI } from "./index";


const cli = new CLI();

cli.registerCommand("hello", {
    action: (params, opts, done) => {
        console.log("Hello Back!");
        done();
    }
});

cli.registerCommand("do", {
    action: (a, b, c) => c(),
    subcommands: {
        something: {
            action: (a, b, c) => {
                console.log(`I Did Something!`);
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
})

cli.show();