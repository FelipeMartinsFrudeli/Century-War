import Tiles from "./tiles.js";

export default class Map {

    mapInstance = {
        teams: []
    };

    tiles: Tiles;   // tiles.data = []

    constructor(mapSize: number) {
        this.tiles = new Tiles(mapSize);
    }

    createMap(teamPlayers: string[]) {

        const tiles = this.tiles;
        const size = tiles.size;
        let teams = [];

        for (let x = 0; x < size; x++) {

            let owner = x > size/2 ? teamPlayers[0] : teamPlayers[1]

            const column = [];

            for (let y = 0; y < tiles.size; y++) {

                const column = [];

                const teamTile = {
                    pos: { x, y },
                    owner,
                    troop: undefined,
                }

                column.push(teamTile);
            }

            teams.push(column);
        }
        
        this.mapInstance.teams = teams
    }

    remove() {
        this.tiles.remove();
        this.mapInstance = undefined;
    }
}