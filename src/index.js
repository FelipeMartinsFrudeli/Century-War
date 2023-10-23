import 'bootstrap';
import connect from './scripts/playerConnections';
localStorage.debug = '*';

window.onload = () => {
    connect();
}