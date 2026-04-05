import { BashExecutionComponent } from "./dist/modes/interactive/components/bash-execution.js";

const ui = { requestRender() {} };
const comp = new BashExecutionComponent("ping localhost", ui, process.cwd(), false);

comp.appendOutput("Pinging...\nReply from 127.0.0.1\n");

setInterval(() => {
    try {
        comp.render(80);
    } catch(e) {
        console.error("FATAL CRASH:", e.stack);
        process.exit(1);
    }
}, 50);

setTimeout(() => {
    console.log("No crash!");
    process.exit(0);
}, 2000);
