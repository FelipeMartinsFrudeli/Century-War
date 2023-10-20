import Player from "./playerInstance.js"

export default class Players {

    constructor() {
        this.playerInstances = {}
    }

    signUpPlayer(id, username) {

        if (username.length === 0) {
            username = id;
        }

        const player = new Player(id, username)
        this.playerInstances[id] = player;

        console.log(`\n player connect`);
        console.dir(this.playerInstances[id]);
    }

    disconnectPlayer(id) {

        console.log(`\n player disconnected`);
        console.dir(this.playerInstances[id]);

        delete this.playerInstances[id];
    }

    isLogged(id) {
        
        if (!this.playerInstances[id]) {
            return false;
        }

        return true;
    }

    getCurrentGameId(id) {

        if (this.playerInstances[id]?.gameId) {
            return this.playerInstances[id].gameId
        }
        
        return ''; 
    }

    setCurrentGameId(id) {
        this.playerInstances[id].gameId = id;
    }
}