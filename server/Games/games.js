
export default class Games {

    gameInstances = {}

    constructor() {
    }

    createGame(hostId, gameInstace) {

        this.gameInstances[hostId] = gameInstace;

        console.log(`\n game instance create: ${hostId}`);
    }

    deleteGame(hostId) {

        if (!this.gameInstances[hostId]) return console.error(`\n game instance: ${hostId} already deleted`);

        this.gameInstances[hostId].deleteMap();
        delete this.gameInstances[hostId];
        
        console.log(`\n game instance deleted: ${hostId}`);
    }

    getGameFromId(hostId) {
        return this.gameInstances[hostId]
    }
}