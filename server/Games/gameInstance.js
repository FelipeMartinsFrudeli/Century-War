
export default class GameInstance {

    constructor(hostId, players, map) {
        this.hostId = hostId;
        this.players = players;
        this.map = map;

        this.map.setOwners(this.players);
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