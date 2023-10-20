process.env.DEBUG="*";

import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import path from 'path';
import fs from 'fs';

import Observer from './server/utils/observers.js';
import Games from './server/Games/games.js';
import Players from './server/Players/players.js';


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

const rooms = {}

const observer = new Observer();
const games = new Games();
const players = new Players();

io.on('connection', (socket) => {
    
    const playerId = socket.id;
    const alertNotLogged = () => console.log(`\n Player ${playerId} is not logged`);

    
    socket.on('player-login', (data) => {

        if (players.isLogged(playerId)) {
            console.log(`\n Player ${playerId} was already logged`);
            return;
        };

        const username = data.username ? data.username : '';
        players.signUpPlayer(playerId, username);
    })


    socket.on('disconnect', () => {

        if (!players.isLogged(playerId)) return alertNotLogged();

        players.disconnectPlayer(playerId);

        const currentGameId = players.getCurrentGameId(playerId);
        if (currentGameId !== '') games.deleteGame(currentGameId);

        // room
    })

    socket.on('create-room', () => {
        
        if (!players.isLogged(playerId)) return alertNotLogged();

        const currentGameId = players.getCurrentGameId(playerId);
        if (currentGameId !== '') games.deleteGame(currentGameId);

        const hostId = `game-${playerId}`;


        // games.createGame(hostId, )
    })
});