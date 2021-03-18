import fs from "fs";
import http from "http";
import path from "path";
import cors from "cors";
import express from "express";
import { Server } from "colyseus";
import dotenv from "dotenv";

/**
 * Do not auto-load `${environment}.env` file when using Arena service.
 */
if (process.env.NODE_ARENA !== "true") {
    const envFilename = (process.env.NODE_ENV === "production")
        ? "arena.env"
        : `${process.env.NODE_ENV}.env`
    const envPath = path.resolve(path.dirname(require!.main!.filename), "..", envFilename);

    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        console.log(`✅  ${envFilename} loaded.`);

    } else {
        console.log(`⚠️  ${envFilename} not found.`);
    }
}

export interface ArenaOptions {
    getId?: () => string,
    initializeExpress?: (app: express.Express) => void,
    initializeGameServer?: (app: Server) => void,
    beforeListen?: () => void,
}

const ALLOWED_KEYS: Array<keyof ArenaOptions> = ['getId', 'initializeExpress', 'initializeGameServer', 'beforeListen'];

export default function (options: ArenaOptions) {
    for (let key in options) {
        if (ALLOWED_KEYS.indexOf(key as keyof ArenaOptions) === -1) {
            throw new Error(`Invalid option '${key}'. Allowed options are: ${ALLOWED_KEYS.join(", ")}`);

        } else if (typeof(options[key as keyof ArenaOptions]) !== "function") {
            throw new Error(`'${key}' should be a function.`);
        }
    }

    return options;
}

/**
 * Listen on your development environment
 * @param options Arena options
 * @param port Port number to bind Colyseus + Express
 */
export function listen(
    options: ArenaOptions,
    port: number = Number(process.env.PORT || 2567)
) {
    const app = express();
    const server = http.createServer(app);

    const gameServer = new Server({ server, });

    // Enable CORS + JSON parsing.
    app.use(cors());
    app.use(express.json());

    options.initializeGameServer?.(gameServer);
    options.initializeExpress?.(app);
    options.beforeListen?.();

    gameServer.listen(port);

    const appId = options.getId?.();
    if (appId) { console.log(`${appId}`); }

    console.log(`⚔️  Listening on ws://localhost:${ port }`);
}
