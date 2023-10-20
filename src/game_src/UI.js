import Input from "./input";
import troops from "./troops";

export default class UI {

    buttonConnection = {};

    constructor(socket) {
        this.socket = socket;
        this.buttonConnection = {};
    }

    createRoomButton(onClick) {
        const createRoom = document.getElementById('create-room');
        createRoom.addEventListener('click', () => onClick());
    }

    setRoomBtn(room) {
        const roomsDiv = document.getElementById('rooms-container');
        const roomBtn = document.createElement('button');
        roomBtn.id = room.id

        const title = this.socket.id == room.id ? 'Minha Sala' : room.name;
        const disabled = this.socket.id == room.id ? true : false;

        roomBtn.disabled = disabled;

        const roomTitle = document.createTextNode(title);
        roomBtn.appendChild(roomTitle);
        roomsDiv.appendChild(roomBtn);

        return roomBtn;
    }

    setupRooms(rooms, callback) {
        for (const roomId in rooms) {

            const room = rooms[roomId];
            
            let roomButton = this.setRoomBtn(room);
            roomButton.addEventListener('click', () => callback(room.id));
        }
    }

    removeRooms() {
        const roomsDiv = document.getElementById('rooms-container');
        const rooms = roomsDiv.children;
        for (let i = 0; i < rooms.length; i++) {
            rooms[i].removeEventListener('click', () => {});
        }
        roomsDiv.innerHTML = ''
    }

    showLobby(bool) {
        const lobby = document.getElementById('lobby');
        if (bool) {
            lobby.style.display = 'flex'
            lobby.style.zIndex = '5'
        } else {
            lobby.style.display = 'none'
            lobby.style.zIndex = '0'
        }
    }

    Login(onClick) {
        const signUp = document.getElementById('sign-up');
        const signUpButton = document.getElementById('sign-up-button');
        const usernameInput = document.getElementById('username');

        signUpButton.addEventListener('click', () => {

            
            const username = usernameInput.value
            // console.log(username, "username");
            if (username.length === 0) return;
            
            onClick({ username: username })

            signUp.style.display = 'none'
            signUp.style.zIndex = '0'

            this.showLobby(true);
        })
    }

    
    setTools(hostId, callback) {

        return;

        this.disconnectTools();

        if (!this.buttonConnection) return;
        
        const troopAddContainer = document.getElementById('troop-add-container')
        const removeTroopButton = document.getElementById('troop-remove-button');
        
        const input = new Input();
        
        input.click(() => callback('remove', ''), removeTroopButton)
        this.buttonConnection[removeTroopButton] = { type: 'click' }

        function createTroopCard(troopName) {

            const cardButton = document.createElement('button');
            cardButton.id = "card-troop";
            cardButton.innerHTML = `${troopName}`
            cardButton.appendChild(troopAddContainer);

            input.click(() => callback('place-troop', troopName), cardButton);

            // console.log(this.buttonConnection);
            this.buttonConnection[cardButton] = { type: 'click' }
        }

        for (const troopName in troops) createTroopCard(troopName);
    }

    disconnectTools() {

        return;

        if (!this.buttonConnection) return;
        for (const instance in this.buttonConnection) {
            if (this.buttonConnection[instance]) {
                const connection = this.buttonConnection[instance]
                if (!connection.type) return;
                instance.removeEventListener(connection.type, () => {})
            }
        }
    }
}