
interface PlayerInstance {
    id: string,
    points: number,
    username: string,
    gameId: string
}

export default class Player implements PlayerInstance {

    id: string;
    points: number;
    username: string;
    gameId: string;

    constructor (id: string, username: string) {

        this.id = id;
        this.username = username;

        this.gameId = '';
        this.points = 0;
    }

}