import $ from 'jquery';

export default class ScreenConfig {

    constructor() {
        if (!this.isMobile()) $('#fullscreen-ui').hide().css('z-index', 0);
        $('#rotate-screen').hide().css('z-index', 0);
        this.showRotateScreenPopup();

        window.addEventListener('orientationchange', () => this.showRotateScreenPopup())
    }

    isMobile() {
        const toMatch = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];
    
        let mobile = false;
        mobile = toMatch.some((toMatchItem) => {
            return navigator.userAgent.match(toMatchItem);
        });
    
        return mobile;
    }

    fullscreenMode() {
        if (!this.isMobile()) return;

        let screen = document.documentElement;
        if (screen.requestFullscreen) screen.requestFullscreen();

        $('#fullscreen-ui').hide(50).css('z-index', 0);
    }

    showRotateScreenPopup() {
        if (!this.isMobile()) return;
        let angle = window.orientation;

        console.log(angle);

        if (angle == 0) $('#rotate-screen').show(0).css('z-index', 40);
        if (angle != 0) $('#rotate-screen').hide(0).css('z-index', 0);
    }
}