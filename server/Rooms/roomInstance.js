
export default class RoomInstance {

    constructor(hostId, name) {
        this.hostId = hostId;
        this.name = name;
        this.players = [];
        this.totalPlayers = 0;
    }
    
}