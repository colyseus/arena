import Arena from "../src";

export default Arena({
    getId: () => "My App 1.0.0",

    initializeExpress: (app) => {
        console.log("custom: initializeExpress()");
        app.get("/", (req, res) => res.send("Hello world!"));
    },

    initializeGameServer: (gameServer) => {
        console.log("custom: initializeGameServer()");
        // gameServer.define("something", );
    },

    beforeListen: () => {
        console.log("custom: beforeListen()");
    }

});