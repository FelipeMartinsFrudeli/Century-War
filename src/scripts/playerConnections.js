
import { io } from "socket.io-client";

import randomId from './utils/idGenerator';
import ControllerGUI from "./Player/GUI/controller";
import Player from "./Player/playerInstance";
import PlayerGame from "./Player/Game/game";
import ClientMap from "./Map/map";
import PlayerScene from "./Player/Game/scene";

export default function connect() {
    const playerId = `user-${randomId()}`
    const player = new Player(playerId);
    const games = {}
    
    const socket = io({
        auth: {
          id: playerId
        }
    });
    
    window.addEventListener('contextmenu', (e) => e.preventDefault(), false);
    
    const controllerGui = new ControllerGUI(playerId);
    controllerGui.setupGui();
    
    controllerGui.playerLogin.onSignUp((username) => {
        if (username === '') return;
        socket.emit('player-login', { username });
        
        player.setUsername(username);
    })
    
    controllerGui.rooms.onJoinRoom((hostId) => {
        socket.emit('join-room', hostId);
    })
    
    controllerGui.rooms.onCreateRoom(() => {
        socket.emit('create-room');
    })
    
    socket.on('update-rooms', (rooms) => {
        controllerGui.rooms.updateRooms(rooms);
    })
    
    const gameWindow = document.getElementById('render-target');
    const playerScene = new PlayerScene(gameWindow);
    
    socket.on('disconnect', () => {
        document.location.href="/";
    })

    socket.on('new-game', (serverGameInstance) => {
        if (!serverGameInstance.map) return console.error(`map of gameInstace is not valid`);
        if (!serverGameInstance.hostId) return console.error(`hostId of gameInstace is not valid`);
        if (!serverGameInstance.players) return console.error(`players of gameInstace is not valid`);
        
        const gameInstance = {
            hostId: serverGameInstance.hostId, 
            players: serverGameInstance.players, 
            teams: serverGameInstance.teams
        }

        if (player.gameId) {
            console.log(`Already in a game with host id ${player.gameId}`)
            games[player.gameId].removeGame();
        }

        if (games[gameInstance.hostId]) {
            console.log(`Already in a game with host id ${gameInstance.hostId}`)
            games[gameInstance.hostId].removeGame();
        };
        
        player.setGameId(gameInstance.hostId);
    
        const game = new PlayerGame({
            clientMap: new ClientMap(serverGameInstance.map, playerScene), 
            playerId,
            gameInstance, 
            playerScene,
            gameWindow
        });
    
        game.playerSelectObjects.onSelectObject((selectedObject) => {
            
            const userData = selectedObject.userData
            if (!userData) return console.error(`Error to get userData`);
            if (typeof userData.x != 'number' || typeof userData.y != 'number') return console.error(`userData position is invalid`);

            const { x, y } = userData;
            const troopName = controllerGui.selectedTroop
            
            socket.emit('place-troop', { troopName, pos: { x, y } })
        })

        game.onRemoveGame((playerLeftName) => {
           game[player.gameId] = undefined;
           player.setGameId(undefined);
           if (typeof playerLeftName === 'string') controllerGui.playerLogin.leftPlayerPopup(playerLeftName);
        })
    
        games[gameInstance.hostId] = game;
        controllerGui.gameStart()
    })
    
    socket.on('create-ground-map', () => {
        if (!games[player.gameId]) return console.log(`Player is not in a game, game id ${player.gameId}`);
        
        const game = games[player.gameId]
        game.clientMap.loadMap(game)
    })
    
    socket.on('remove-game', (playerLeftName) => {
        if (!games[player.gameId]) return console.log(`Player is not in a game, game id ${player.gameId}`);
    
        const game = games[player.gameId];
        game.removeGame(playerLeftName);
    
        controllerGui.rooms.showRooms(true);
    })
    
    socket.on('update-map', (data) => {
        if (!data) return console.error(`Error to receive data from update-map: ${data}`);
        if (!data.updateType) return console.error(`Update type is not defined: ${data}`);
        
        const game = games[player.gameId];
        const gameInstance = game.gameInstance
        if (!gameInstance) return console.error(`gameInstance is ${gameInstance}`);
        
        // console.log(data, `data`);
        game.clientMap.updateMap(data.updateType, data, gameInstance.players, player.id);
    })
}