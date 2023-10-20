localStorage.debug = '*';


import { io } from "socket.io-client";
import Game from './game_src/game';
import UI from "./game_src/UI";

const game = new Game();
const socket = io();
const playerInterface = new UI(socket);

playerInterface.createRoomButton(() => socket.emit('create-room'))

game.onPlaceObjects((data) => {

    // console.log(game.hostId);

    if (!game.hostId) return;
    const { toolAction, pos, troopName } = data;

    for (let i in { toolAction, pos, troopName } ) {
        if(!data[i]) {
            console.error('error to place a troop in map', i);
            console.dir(data)
            return;
        }
    }

    // console.log(toolAction, pos, troopName);
    socket.emit(toolAction, { pos, troopName });
})


socket.on('connect', () => {
    playerInterface.Login((data) => {
        console.log(`aa`);
        socket.emit('player-login', data)
    });
});

socket.on('update-rooms', (data) => {
    
    if (!data?.rooms) {
        console.error(`Error to receive rooms: ${data}`);
        return;
    }
    
    if (data.hostId) {
        game.setHostId(data.hostId);
    };
    
    for (const roomId in data.rooms) {

        const room = data.rooms[roomId];
        
        if (!room?.name || !room?.id) {
            console.error(`room invalid room: ${room}`);
            console.dir(data);
            return;
        }
    }
    
    console.log(`update-rooms, hostId: ${game.hostId}`);
    // console.dir(data)
    
    playerInterface.removeRooms();
    playerInterface.setupRooms(data.rooms, (roomId) => socket.emit('join-game', roomId));
});

socket.on('create-ground-map', (data) => {
    if (!data?.mapData) {
        console.error(`mapData is not defined`);
        return;
    }

    if (!data?.hostId) {
        console.error(`hostId is not defined`);
        return;
    }
    
    game.setHostId(data.hostId);
    console.log(`create new room, hostId: ${game.hostId}`);
    
    game.loadMap(data.mapData)
    game.selectTool('place-troop', 'knight')

    playerInterface.showLobby(false);

    playerInterface.setTools(data.hostId, (toolId, toolData) => {
        game.toolAction.selectTool(toolId, toolData);
    });
})

socket.on('update-map', (data) => {
    
    if (!data) {
        console.error(`Error to receive data from update-map: ${data}`);
        return;
    }

    if (!data.updateType) {
        console.error(`Update type is not defined: ${data}`);
        return;
    }

    console.log('update-map');
    // console.log(data.updateType);
    // console.dir(data)

    game.updateMap(data.updateType, data);
})

socket.on('remove-map', () => {
    playerInterface.showLobby(true);

    console.log(`map removed hostId: ${game.hostId}`);
    game.setHostId(null);

    game.deleteMap();

    playerInterface.disconnectTools();
})