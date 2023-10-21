
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


const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('dist/public'));

app.get('/', (req, res) => {

    const indexFile = path.resolve('./src/index.html');

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
    io.sockets.emit('update-rooms', { type: 'update-rooms', rooms: rooms.getRooms() })
})

io.sockets.on('connection', (socket) => {
    
    const handshake = socket.handshake
    const playerId = handshake.auth.id;

    socket.on('player-login', (data) => {

        clients.clientLogin(playerId, data);
        emitter.emit('update-rooms');
    })

    socket.on('disconnect', () => {

        const gameId = clients.players.getCurrentGameFromId(playerId);
        if (gameId) {
            if (rooms.getRoomFromId(gameId)) rooms.removeRoom(gameId);
            if (games.getGameFromId(gameId)) games.deleteGame(gameId);
            emitter.emit(`delete-${gameId}`)
        }

        // console.log(`\n`);
        // console.dir(games)
        // console.log(`\n`);
        // console.dir(rooms)

        clients.clientDisconnect(playerId);
    })
    
    function joinGame(hostId) {
        const player = clients.players.getPlayerFromId(playerId);

        if (player.gameId != '') games.deleteGame(hostId);
        clients.players.setGameFromId(playerId, hostId);

        socket.join(hostId);
        return player
    }

    function leaveOnDelete(hostId, playerId) {
        emitter.once(`delete-${hostId}`, () => {
            socket.emit('remove-map')
            socket.leave(playerId);
            emitter.emit('update-rooms');
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

    socket.on('join-game', (hostId) => {

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
        
        if (room.totalPlayers >= MIN_PLAYERS_START ) {

            games.createGame(hostId, new GameInstance(hostId, room.players, new ServerMap(MAP_SIZE)))

            const tilesData = games.gameInstances[hostId].map.getTilesData();

            io.to(hostId).emit('create-ground-map', { mapData: tilesData, hostId });
            rooms.removeRoom(hostId);
            emitter.emit('update-rooms');
        }
    })
});


server.listen(3030)