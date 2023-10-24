
export default class Player {

    constructor(id) {

        this.id = id;
        this.username = id;

        this.gameId = '';
        this.points = 0;
    }

    setUsername(username) {
        this.username = username
    }

    setGameId(hostId) {
        this.gameId = hostId
    }
    
}