
export default class GameInstance {

    constructor(hostId, players, map) {
        this.hostId = hostId;
        this.players = players;
        this.map = map;
    }

    setup() {
        if (!this.map) return console.error(`map not exists`);
        this.map.createMap(this.players);
    }

    deleteMap() {
        if (!this.map) return console.error(`map not exists`);
        this.map.remove();
    }
}