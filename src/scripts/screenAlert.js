import Input from './input.js';

export default function initScreenAlert() {

    let initialUI = document.getElementById("ui-initial");
    let rotateScreenUI = document.getElementById("rotate-screen");

    function isMobile() {
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

    rotateScreenUI.style.display = "none";

    function showRotateScreen() {
        if (!isMobile()) return;

        let angle = window.orientation;

        if (angle == 0) {
            rotateScreenUI.style.display = "block";
            initialUI.style.zIndex = 10;
        }
        else {
            rotateScreenUI.style.display = "none";
        }
    }

    showRotateScreen()
    window.addEventListener("orientationchange", showRotateScreen, false);

    const button = document.getElementById('toggle');
    const buttonOff = document.getElementById('toggle-off');
    const fullScreenUi = document.getElementById('fullscreen-ui');

    if (isMobile()) {
        fullScreenUi.style.display = "flex"
        initialUI.style.zIndex = 10;
    }

    const input = new Input();

    function removeMenu() {
        fullScreenUi.style.display = 'none';
        initialUI.style.zIndex = 0;
    }

    function requestFullScreen() {
        let screen = document.documentElement;
        removeMenu();
        if (screen.requestFullscreen) {
            screen.requestFullscreen();
        }
    }

    input.click(requestFullScreen, button);
    input.touchend(requestFullScreen, button);

    input.click(removeMenu, buttonOff);
    input.touchend(removeMenu, buttonOff);
}