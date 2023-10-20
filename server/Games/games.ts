import Map from "../Map/map.js";
import Game from "./gameInstance.js"

export default class Games {

    MAP_SIZE = 24;
    gameInstances = {}

    constructor() {
    }

    createGame(hostId: string, playersInGame: string[]) {

        const game = new Game(hostId, playersInGame, new Map(this.MAP_SIZE));
        this.gameInstances[hostId] = game;

        console.log(`\n game instance create: ${hostId}`);
    }

    deleteGame(hostId: string) {

        if (!this.gameInstances[hostId]) {
            console.error(`\n game instance: ${hostId} already deleted`);
            return;
        }

        this.gameInstances[hostId].delete();
        
        delete this.gameInstances[hostId];
        
        console.log(`\n game instance deleted: ${hostId}`);
    }
}