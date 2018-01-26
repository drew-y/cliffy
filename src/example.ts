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
})

cli.show();