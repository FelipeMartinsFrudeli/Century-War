import Player from "./playerInstance.js"

export default class Players {

    playerInstances = {}

    constructor() {}

    signUpPlayer(id: string, username: string) {

        if (username.length === 0) {
            username = id;
        }

        const player = new Player(id, username)
        this.playerInstances[id] = player;

        console.log(`\n player connect`);
        console.dir(this.playerInstances[id]);
    }

    disconnectPlayer(id: string) {

        console.log(`\n player disconnected`);
        console.dir(this.playerInstances[id]);

        delete this.playerInstances[id];
    }

    isLogged(id: string): boolean {
        
        if (!this.playerInstances[id]) {
            return false;
        }

        return true;
    }

    getCurrentGameId(id: string): string {
        return this.playerInstances[id].gameId
    }
}