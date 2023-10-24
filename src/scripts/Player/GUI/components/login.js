import $ from 'jquery';

export default class LoginGUI {

    constructor(playerId) {

        this.observers = [];
        this.playerId = playerId;
        
        $('#player-left-popup').hide();
        $('#player-cooldown-popup').hide();
        $('#sign-up').hide();
    }
    
    showSignUp(show) {
        if (show) $('#sign-up').fadeIn(100).css('z-index', 10);
        if (!show) $('#sign-up').fadeOut(100).css('z-index', 0);
    }

    signUp(username) {

        if (!username || username.length === 0) return;
        
        for (const observer of this.observers) {
            if (typeof observer === 'function') observer(username)
        }
    }

    onSignUp(fn) {
        this.observers.push(fn);
        return fn;
    }

    removeListener(fn) {
        this.observers = this.observers.filter((observer) => observer != fn);
    }

    leftPlayerPopup(leftPlayer) {
        $('#player-left-popup').fadeIn(100).css('z-index', 15);;
        $('#player-left-text').text(`${leftPlayer}`);

        $('#player-left-popup').fadeOut(3000).css('z-index', 0);
    }
}