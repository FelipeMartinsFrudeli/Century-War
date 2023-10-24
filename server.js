
import fs from 'fs';
import http from 'http';
import express from 'express';
import path from 'path';
import { Server } from 'socket.io';
import { EventEmitter } from 'stream';

import ClientsConnection from './server/clientConnection.js';
import Rooms from './server/Rooms/rooms.js';
import Games from './server/Games/games.js';

import ServerMap from './server/Games/Map/serverMap.js';
import RoomInstance from './server/Rooms/roomInstance.js';
import GameInstance from './server/Games/gameInstance.js';

const PORT = process.env.PORT || 3031

const app = express();
const server = http.createServer(app);
const io = new Server(server);

if (process.env.NODE_ENV == 'production') {
    app.use(express.static('public'));
    var indexFile = path.resolve('./public/index.html');
} else {
    app.use(express.static('dist/public'));
    var indexFile = path.resolve('./src/index.html');
}

app.get('/', (req, res) => {

    fs.readFile(indexFile, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro no servidor ao carregar o arquivo!');
        }

        return res.send(data);
    });
})


const MAP_SIZE = 24
const MIN_PLAYERS_START = 2

const emitter = new EventEmitter();

const clients = new ClientsConnection();
const rooms = new Rooms();
const games = new Games();

emitter.on('update-rooms', () => {
    io.sockets.emit('update-rooms', rooms.getRooms())
})

io.sockets.on('connection', (socket) => {
    
    const handshake = socket.handshake
    const playerId = handshake.auth.id;

    socket.on('player-login', (data) => {
        socket.join(playerId);
        clients.clientLogin(playerId, data);
        emitter.emit('update-rooms');
    })

    socket.on('disconnect', () => {

        const gameId = clients.players.getCurrentGameFromId(playerId);
        if (gameId) {
            if (rooms.getRoomFromId(gameId)) rooms.removeRoom(gameId);
            if (games.getGameFromId(gameId)) games.deleteGame(gameId);
            emitter.emit(`delete-${gameId}`, playerId)
        }

        clients.clientDisconnect(playerId);
    })
    
    function joinGame(hostId) {
        const player = clients.players.getPlayerFromId(playerId);

        if (player.gameId != '') games.deleteGame(hostId);
        clients.players.setGameFromId(playerId, hostId);
        clients.players.setLifeFromId(playerId, 300);
        socket.emit('life-player', 300);

        socket.join(hostId);
        return player
    }

    function leaveOnDelete(hostId, playerId) {
        emitter.once(`delete-${hostId}`, (leftPlayer) => {

            const leftPlayerName = clients.players.getPlayerFromId(leftPlayer)?.username
            
            socket.emit('remove-game', leftPlayerName);
            emitter.emit('update-rooms');
            socket.leave(playerId);
        })
    }

    socket.on('create-room', () => {

        if (!clients.players.isLogged(playerId)) return clients.alertNotLogged(playerId);
        
        const hostId = `game-${playerId}`;
        if (rooms.hasPlayer(hostId, playerId)) return;

        const player = joinGame(hostId);
        
        leaveOnDelete(hostId, playerId);

        rooms.createRoom(new RoomInstance(hostId, player.username))
        rooms.join(hostId, player.id);
        emitter.emit('update-rooms');
    })

    socket.on('join-room', (hostId) => {

        if (!rooms.getRoomFromId(hostId)) return console.error(`\n Room not exist from ${hostId}`);
        if (!clients.players.isLogged(playerId)) return clients.alertNotLogged();

        if (rooms.hasPlayer(hostId, playerId)) return;

        if (rooms.getRoomFromId(`game-${playerId}`)) {
            rooms.removeRoom(`game-${playerId}`);
            emitter.emit(`delete-game-${playerId}`);
        }

        const player = joinGame(hostId);
        
        rooms.join(hostId, player.id);
        leaveOnDelete(hostId, playerId);
        
        const room = rooms.getRoomFromId(hostId)
        
        if ( room.totalPlayers >= MIN_PLAYERS_START ) {

            games.createGame(hostId, new GameInstance(hostId, room.players, new ServerMap(MAP_SIZE)))

            const gameInstance = games.getGameFromId(hostId)
            io.to(hostId).emit('new-game', gameInstance);
            io.to(hostId).emit('create-ground-map');

            rooms.removeRoom(hostId);
            emitter.emit('update-rooms');
            
            setTimeout(() => {
                gameInstance.loaded = true
            }, 500)
        }
    })

    function checkGame() {
        const playerCurrentGame = clients.players.getCurrentGameFromId(playerId);
        if (playerCurrentGame === '') {
            console.error('\n player is not in a game');
            return false;
        }
        
        const gameInstance = games.getGameFromId(playerCurrentGame)
        if(!gameInstance) return console.error('gameInstance is undefined')
        if(!gameInstance.loaded) return console.error('gameInstance is not loaded')
        if(!gameInstance.players) return console.error('players is not undefined');

        if (!gameInstance.players.includes(playerId)) {
            console.error(`player is not in current gameInstance`)
            return false;
        }

        return true;
    }

    socket.on('place-troop', (data) => {

        if (!data.troopName) return console.error('\n troopName is not defined');
        if (!data.pos) return console.error('\n position is not defined');
        
        if (!checkGame()) return;

        const playerCurrentGame = clients.players.getCurrentGameFromId(playerId);
        const game = games.getGameFromId(playerCurrentGame);
        game.map.placeTroop(playerId, data, (newTroop) => {

            io.to(playerCurrentGame).emit('update-map', { updateType: 'placeTroop', newTroop });

            setTimeout(() => {
                io.to(playerCurrentGame).emit('update-map', { updateType: 'moveTroop', pos: newTroop.pos });
            }, 800)

            setTimeout(() => {
                game.map.removeTroop(playerId, { pos: data.pos }, (pos) => {
                    io.to(playerCurrentGame).emit('update-map', { updateType: 'removeTroop', pos })
                })
            }, 4000)
        })
    }) 

    socket.on('damage-player', (data) => {

        if (!data?.playerId || !data?.damage) return;
        
        const player = clients.players.getPlayerFromId(data.playerId);

        const newLife = player.life - data.damage
        if (typeof newLife != 'number') return console.error('invalid life');

        if (newLife <= 0) {
            
            clients.players.setLifeFromId(playerId,  0);
            io.to(data.playerId).emit('life-player', 0);
            socket.disconnect(true);

        } else {
            
            clients.players.setLifeFromId(playerId,  newLife);
            io.to(data.playerId).emit('life-player', newLife);
        }
        
        // console.log(`damage event`, data);
    })
    
    socket.on('remove-troop', (data) => {
        
        if (!data?.pos) return console.error('\n position is not defined');
        
        if (!checkGame()) return;
        
        const playerCurrentGame = clients.players.getCurrentGameFromId(playerId);
        const game = games.getGameFromId(playerCurrentGame);
        game.map.removeTroop(playerId, data, () => {
            
            io.to(playerCurrentGame).emit('update-map', { updateType: 'removeTroop', pos: data.pos });
        })
    })

});


server.listen(PORT, () => console.log(`listen port: ${PORT}`))