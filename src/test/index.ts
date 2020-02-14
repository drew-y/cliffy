import { CLI } from "../index";
import assert = require("assert");
import { MockReadableStream, MockWriteableStream } from "mock-streams";


describe("CLI", function() {
    let input = new MockReadableStream();
    let output = new MockWriteableStream();
    const send = (msg: string) => input.push(`${msg}\n`);
    let cli: CLI;

    beforeEach(function() {
        input = new MockReadableStream();
        output = new MockWriteableStream();
        cli = new CLI({ output, input }).show();
    });

    it("Should register a command", function() {
        cli.addCommand("test", { action() { } });
        assert.ok(cli.hasCommand("test"));
    });

    it("Should execute a command", function() {
        return new Promise(res => {
            cli.addCommand("test", { action: res });
            send("test");
        });
    });

    it("Should execute a shorthand command", function() {
        return new Promise(res => {
            cli.addCommand("test", res);
            send("test");
        });
    });

    it("Should execute a sub command", function() {
        return new Promise(res => {
            cli.addCommand("cmd", {
                action() { },
                subcommands: {
                    subcmd: res
                }
            });
            send("cmd subcmd");
        });
    });

    it("Should accept and convert parameters", function() {
        return new Promise((res, rej) => {
            cli.addCommand("test", {
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
            send("test hello world 4 false correct");
        });
    });

    it("Should accept and convert shorthand parameters", function() {
        return new Promise((res, rej) => {
            cli.addCommand("test", {
                parameters: ["p1", "p2"],
                action(params) {
                    const correct = params.p1 === "hello" && params.p2 === "world";
                    if (correct) { res(); } else { rej(new Error("Bad params")); }
                }
            });
            send("test hello world");
        });
    });

    it("Should accept single and double quoted parameters", function() {
        return new Promise((res, rej) => {
            cli.addCommand("test", {
                parameters: [
                    { label: "p1", type: "string" },
                    { label: "p2", type: "string" }],
                action(params) {
                    const correct = params.p1 === "hello \"quoted\" world" && params.p2 === "lovely 'quoted' weather";
                    if (correct) { res(); } else { rej(new Error("Bad params")); }
                }
            });
            send("test 'hello \"quoted\" world' \"lovely 'quoted' weather\"");
        });
    });
    it("Should accept json-style parameters", function() {
        return new Promise((res, rej) => {
            cli.addCommand("test", {
                parameters: [
                    { label: "p1", type: "string" }],
                action(params) {
                    const correct = params.p1 === "{\"text\":\"This is the weather\"}";
                    if (correct) { res(); } else { rej(new Error("Bad params")); }
                }
            });
            const testJson = JSON.stringify({text:"This is the weather"});
            send(`test '${testJson}'`);
        });
    });

    it("Should throw an error on invalid optional parameter order", function() {
        try {
            cli.addCommand("test", {
                parameters: [
                    { label: "p1" },
                    { label: "p2", type: "string" },
                    { label: "p3", type: "number", optional: true },
                    { label: "p4", type: "boolean" },
                    { label: "p5", type: val => val === "correct" },
                ],

                action(params) { }
            });
        } catch (error) { return; }
        throw new Error("Did not throw error correctly");
    });

    it("Should throw an error on invalid rest parameter order", function() {
        try {
            cli.addCommand("test", {
                parameters: [
                    { label: "p1" },
                    { label: "p2", type: "string" },
                    { label: "p3", type: "number", rest: true },
                    { label: "p4", type: "boolean" },
                    { label: "p5", type: val => val === "correct" },
                ],

                action(params) { }
            });
        } catch (error) { return; }
        throw new Error("Did not throw error correctly");
    });

    it("Should accept and convert rest parameters", function() {
        return new Promise((res, rej) => {
            cli.addCommand("test", {
                parameters: [{ label: "p3", type: "number", rest: true }],
                action(params) {
                    if (!(params.p3 instanceof Array)) return rej();
                    if (params.p3[0] === 1 && params.p3[1] === 2) return res();
                    rej();
                }
            });
            send("test 1 2");
        });
    });

    it("Should accept optional parameters", function() {
        return new Promise((res, rej) => {
            cli.addCommand("test", {
                parameters: [
                    { label: "p1", type: "number" },
                    { label: "p2", type: "number", optional: true },
                    { label: "p3", type: "number", optional: true },
                ],

                action(params) {
                    const { p1, p2, p3 } = params;
                    const correct = p1 === 1 && p2 === 2 && p3 === undefined;
                    if (correct) res(); else rej();
                }
            });
            send("test 1 2");
        });
    });

    it("Should accept options", function() {
        return new Promise((res, rej) => {
            cli.addCommand("test", {
                options: ["hello", "world"],
                action(_params, opts) {
                    const correct = opts.hello && !opts.world;
                    if (correct) return res();
                    rej(new Error("Bad opts"));
                }
            });
            send("test @hello");
        });
    });
});
