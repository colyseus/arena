import http from "http";
import express from "express";
import { Server } from "colyseus";

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

    options.initializeExpress?.(app);
    options.initializeGameServer?.(gameServer);
    options.beforeListen?.();

    gameServer.listen(port);
}