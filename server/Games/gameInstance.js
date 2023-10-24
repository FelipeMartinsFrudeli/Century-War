
export default class GameInstance {

    constructor(hostId, players, map) {
        this.hostId = hostId;
        this.players = players;
        this.map = map;

        this.teams = {}
        const random = Math.random() * (100 - 1) + 1;

        if (random < 50) {
            this.teams[players[0]] = 'england'
            this.teams[players[1]] = 'france'
        }

        if (random >= 50) {
            this.teams[players[0]] = 'france'
            this.teams[players[1]] = 'england'
        }
        
        this.map.setOwners(this.players, this.teams);
    }

    getTilesData() {
        if (!this.map) return console.error(`map not exists`);
        return this.map.getData()
    }

    getMap() {
        if (!this.map) return console.error(`map not exists`);
        return this.map
    }

    deleteMap() {
        if (!this.map) return console.error(`map not exists`);
        this.map.remove();
    }
}