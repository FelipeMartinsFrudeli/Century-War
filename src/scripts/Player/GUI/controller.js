
import $ from 'jquery';

import LoginGUI from './components/login';
import RoomsGUI from './components/rooms';
import ScreenConfig from './screenConfig';

// SCREEN CONFIGS
export default class ControllerGUI {

    constructor(playerId) {
        this.playerId = playerId
        this.screenConfig = new ScreenConfig();
        this.playerLogin = new LoginGUI(playerId); 
        this.rooms = new RoomsGUI(playerId);
        this.selectedTroop = 'rogue'
    }

    setupGui() {
        this.setupScreenConfig();
        this.setupRooms();
        this.setupLogin();
    }

    setupScreenConfig() {
        $('#fullscreen-allow')[0].addEventListener('click', () => this.screenConfig.fullscreenMode())
        $('#fullscreen-refuse')[0].addEventListener('click', () => $('#fullscreen-ui').hide(50).css('z-index', 0))        
    }

    setupLogin() {
        this.playerLogin.showSignUp(true)

        this.playerLogin.onSignUp((username) => {
            if (username === '') return;
            this.playerLogin.showSignUp(false)
        })

        $('#sign-up-button')[0].addEventListener('click', () => this.playerLogin.signUp($('#username')[0].value));
    }

    setupRooms() {

        this.rooms.showRooms(false)
        this.playerLogin.onSignUp(() => this.rooms.showRooms(true))
        
        $('#create-room')[0].addEventListener('click', () => this.rooms.createRoom());
    }

    gameStart() {
        this.rooms.showRooms(false)
    }

}



