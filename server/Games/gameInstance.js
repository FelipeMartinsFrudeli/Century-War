
export default class Game {

    constructor(hostId, players, map) {
        this.hostId = hostId;
        this.players = players;
        this.map = map;
    }

    delete() {
        this.map.remove();
    }
}