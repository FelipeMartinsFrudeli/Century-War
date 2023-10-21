
export default class Rooms {
    
    constructor() {
        this.roomInstances = {};
    }

    createRoom(room) {
        this.roomInstances[room.hostId] = room;
    }

    removeRoom(hostId) {
        if (!this.roomInstances[hostId]) return console.error(`\n Room ${hostId} do not exists`);;
        delete this.roomInstances[hostId]
    }

    getRooms() {
        return this.roomInstances;
    }

    getRoomFromId(hostId) {
        return this.roomInstances[hostId]
    }

    join(hostId, playerId) {
        if (!this.roomInstances[hostId]) return console.error(`\n Error to find room ${hostId}`);
        
        const players = this.roomInstances[hostId].players
        const index = players.indexOf(playerId)
        
        // check if player is added 
        if (index !== -1) return;

        this.roomInstances[hostId].players.push(playerId)
        this.roomInstances[hostId].totalPlayers += 1
    }

    hasPlayer(hostId, playerId) {
        if (!this.roomInstances[hostId]) return;

        const players = this.roomInstances[hostId].players
        const index = players.indexOf(playerId)

        if (index === -1) return false; 

        return true;
    }

    leave(hostId, playerId) {
        if (!this.roomInstances[hostId]) return console.error(`\n Error to find room ${hostId}`);

        const players = this.roomInstances[hostId].players
        const index = players.indexOf(playerId)

        this.roomInstances[hostId].players.splice(index, 1)
    }
}