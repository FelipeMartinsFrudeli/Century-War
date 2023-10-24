
export default class Players {

    constructor() {
        this.playerInstances = {}
    }

    signUpPlayer(player) {
        
        this.playerInstances[player.id] = player;

        console.log(`\n player connect ${player.id}`);
    }

    disconnectPlayer(id) {

        delete this.playerInstances[id];
        
        console.log(`\n player disconnected ${id}`);
    }

    isLogged(id) {
        
        if (!this.playerInstances[id]) {
            return false;
        }

        return true;
    }

    getPlayerFromId(id) {

        if (!this.playerInstances[id]) {
            console.error(`\n Error to get player from id: ${id}`);
            return;
        }

        return this.playerInstances[id];
    }

    getCurrentGameFromId(id) {

        if (this.playerInstances[id]?.gameId) {
            return this.playerInstances[id].gameId;
        }
        
        return ''; 
    }

    setGameFromId(id, hostId) {

        if (!this.playerInstances[id]) {
            console.error(`\n Error to get player from id: ${id}`);
            return;
        }

        this.playerInstances[id].gameId = hostId
    }

    setLifeFromId(id, value) {

        if (!this.playerInstances[id]) {
            console.error(`\n Error to get player from id: ${id}`);
            return;
        }

        this.playerInstances[id].life = value
    }
}