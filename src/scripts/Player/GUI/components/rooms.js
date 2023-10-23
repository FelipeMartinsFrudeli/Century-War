import $ from 'jquery';

export default class RoomsGUI {

    constructor(playerId) {

        this.observers = {
            joinRoom: [],
            createRoom: []
        };
        this.playerId = playerId;
    }

    showRooms(show) {
        if (show) $('#rooms').fadeIn(100).css('z-index', 10);
        if (!show) $('#rooms').fadeOut(0).css('z-index', 0);
    }
    
    newRoom(name, id, disabled = false) {
        const button = document.createElement('button');
        const nameText = document.createTextNode(`${name}`)
        button.appendChild(nameText)
        button.disabled = disabled;

        button.addEventListener('click', () => this.joinRoom(id))

        $('#rooms-container').append(button)
    }

    updateRooms(rooms) {

        $('#rooms-container').empty();

        for (const index in rooms) {

            const room = rooms[index]
            if (!room.hostId) return console.error(`\n Room hostId is invalid`);
            if (!room.name) return console.error(`\n Room name is invalid`);

            const disabled = room.hostId === `game-${this.playerId}`
            const name = disabled ? 'Minha Sala' : `Sala de ${room.name}`;
            this.newRoom(name, room.hostId, disabled)
        }

    }

    joinRoom(id) {
        
        if (!id) return;

        for (const observer of this.observers.joinRoom) {
            if (typeof observer === 'function') observer(id)
        }
    }

    createRoom() {
        for (const observer of this.observers.createRoom) {
            if (typeof observer === 'function') observer()
        }
    }

    onJoinRoom(fn) {
        this.observers.joinRoom.push(fn);
        return fn;
    }

    onCreateRoom(fn) {
        this.observers.createRoom.push(fn);
        return fn;
    }

    removeListener(fn) {
        this.observers = this.observers.joinRoom.filter((observer) => observer != fn);
        this.observers = this.observers.createRoom.filter((observer) => observer != fn);
    }
}