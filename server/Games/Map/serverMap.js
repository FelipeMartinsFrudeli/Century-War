import Tiles from "./tiles.js";

export default class ServerMap {

    constructor(mapSize) {
        this.mapInstance = {};
        this.mapInstance.tiles = new Tiles(mapSize); // tiles.data = []
    }

    getTilesData() {
        if (!this.mapInstance.tiles?.data) {
            console.error(`tiles data not exists`);
            return;
        }

        return this.mapInstance.tiles.data;
    }

    createMap(teamPlayers) {

        const tiles = this.mapInstance.tiles;
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
        this.mapInstance.tiles.remove();
        this.mapInstance = undefined;
    }
}