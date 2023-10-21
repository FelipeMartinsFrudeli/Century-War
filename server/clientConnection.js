
import Player from './Players/playerInstance.js';
import Players from './Players/players.js';

/*
*   PlayerInstance: {
*       id: socket.id,
*       username: username or id,
*       points: 0
*   }
*
*   GameInstance: {
*       [hostId]: {
*           hostId,
*           players: { [playerId]: PlayerInstance, ... },
*           serverMap: new ServerMap(size, players) { return dataMap }
*       },
*       ...
*   }
*
*   io.of(hostId).emit('update-map', newTroop: TroopInstance, reloadAllInstances: boolean);
*/

export default class ClientsConnection {

    constructor() {
        this.players = new Players();
        this.alertNotLogged = (id) => console.log(`\n Player ${id} is not logged`);
    }

    clientLogin(playerId, data) {

        if (this.players.isLogged(playerId)) {
            console.log(`\n Player ${playerId} was already logged`);
            return;
        };

        const username = data.username ? data.username : '';
        if (username.length === 0) username = id;

        this.players.signUpPlayer(new Player(playerId, username));
    }

    clientDisconnect(playerId) {

        if (!this.players.isLogged(playerId)) return this.alertNotLogged(playerId);

        this.players.disconnectPlayer(playerId);
    }
}