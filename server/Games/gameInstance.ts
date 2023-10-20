import Map from "../Map/map.js";

interface GameInstance {
    hostId: string,
    players: object,
    map: Map
}

export default class Game implements GameInstance {

    hostId: string
    players: object
    map: Map

    constructor(hostId: string, players: string[], map: Map) {
        this.hostId = hostId;
        this.players = players;
        this.map = map;
    }

    delete() {
        this.map.remove();
    }
}