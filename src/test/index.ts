import { CLI } from "../index";
import assert = require("assert");
import { MockReadableStream, MockWriteableStream } from "mock-streams";

const input = new MockReadableStream();
const output = new MockWriteableStream();
const send = (msg: string) => input.push(`${msg}\n`);

describe("CLI", function() {
    let cli: CLI;
    beforeEach(function() {
        cli = new CLI({ output, input });
        cli.show();
    });

    it("Should register a command", function() {
        cli.command("test", { action() {} });
        assert.ok(cli.hasCommand("test"));
    });

    it("Should execute a command", function() {
        const prom = new Promise(res => {
            cli.command("test", { action() { res(); } });
        });
        send("test");
        return prom;
    });

    it("Should execute a command", function() {
        const prom = new Promise(res => {
            cli.command("test", { action() { res(); } });
        });
        send("test");
        return prom;
    });

    it("Should execute a command", function() {
        const prom = new Promise(res => {
            cli.command("test", { action() { res(); } });
        });
        send("test");
        return prom;
    });

    it("Should accept and convert parameters", function() {
        const prom = new Promise((res, rej) => {
            cli.command("test", {
                parameters: [
                    { label: "p1" },
                    { label: "p2", type: "string" },
                    { label: "p3", type: "number" },
                    { label: "p4", type: "boolean" },
                    { label: "p5", type: val => val === "correct" },
                ],
                action(params) {
                    const correct = params.p1 === "hello" && params.p2 === "world" &&
                        params.p3 === 4 && params.p4 === false && params.p5 === true;
                    if (correct) { res(); } else { rej(new Error("Bad params")); }
                }
            });
        });
        send("test hello world 4 false correct");
        return prom;
    });

    it("Should accept options", function() {
        const prom = new Promise((res, rej) => {
            cli.command("test", {
                options: ["hello", "world"],
                action(params, opts) {
                    const correct = opts.hello && !opts.world;
                    if (correct) { res(); } else { rej(new Error("Bad opts")); }
                }
            });
        });
        send("test @hello");
        return prom;
    });
});
