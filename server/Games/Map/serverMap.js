import Tiles from "./tiles.js";
import troops from "../../../src/data/troops";

export default class ServerMap {

    constructor(mapSize) {
        this.mapInstance = {};
        this.mapInstance.tiles = new Tiles(mapSize); // tiles.data = []
    }

    getData() {
        if (!this.mapInstance.tiles?.data) {
            console.error(`\n tiles data not exists`);
            return;
        }

        return this.mapInstance.tiles.data;
    }

    checkPosition({ x, y }) {
        if (typeof x !== 'number') {
            console.error(`\n x position is not defined`)
            return false;
        };

        if (typeof y !== 'number') {
            console.error(`\n y position is not defined`)
            return false;
        };

        return true;
    }
    
    placeTroop(playerId, data, callback) {

        if (!this.mapInstance.tileInfo) return console.error(`\n tile info is not defined`);
        if (!this.checkPosition(data.pos)) return;

        const { x, y } = data.pos;

        if (!this.mapInstance.tileInfo[x][y]) return console.error(`\n tile info position is invalid`);
        if (this.mapInstance.tileInfo[x][y].owner !== playerId) return console.error(`\n permission not enough in tile x ${x}, y ${y}`);

        const name = data.troopName
        if (typeof name !== 'string') console.error(`\n troopName needs to be a string`);

        if (!troops[name]) return console.error(`\n error to find troop ${name}`);
        const newTroop = troops[name](playerId);

        this.mapInstance.tileInfo[x][y].troop = newTroop;
        newTroop.pos = {x, y};

        callback(newTroop)
    }

    removeTroop(playerId, data, callback) {
        if (!this.mapInstance.tileInfo) return console.error(`\n tile info is not defined`);
        if (!this.checkPosition(data.pos)) return;

        const { x, y } = data.pos;

        if (this.mapInstance.tileInfo[x][y].owner !== playerId) return console.error(`\n permission not enough in tile ${x, y}`);
        
        this.mapInstance.tileInfo[x][y].troop = undefined;

        callback(data.pos)
    }

    setOwners(players, teams) {

        const tiles = this.mapInstance.tiles;
        const size = tiles.size;
        let tileInfo = [];

        for (let x = 0; x < size; x++) {

            let index = x > size/2 ? 0 : 1
            let ownerPlayer = players[index]
            let team = teams[ownerPlayer]

            const column = [];

            for (let y = 0; y < size; y++) {

                const tile = {
                    pos: { x, y },
                    owner: ownerPlayer,
                    troop: undefined,
                }

                this.mapInstance.tiles.setTerrain(team, { x, y })
                column.push(tile);
            }

            tileInfo.push(column);
        }

        this.mapInstance.tileInfo = tileInfo
    }

    remove() {
        this.mapInstance.tiles.remove();
        this.mapInstance = undefined;
    }
}