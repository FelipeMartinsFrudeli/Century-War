
export default class Tiles {

    constructor(size) {

        let data = []

        for (let x = 0; x < size; x++) {

            const column = [];

            for (let y = 0; y < size; y++) {

                const tile = {
                    pos: { x, y },
                    terrainId: undefined,
                    // add trees
                };

                column.push(tile);
            }

            data.push(column);
        }

        this.size = size;
        this.data = data;
    }

    setTerrain(id, { x, y }) {
        if (!this.data) return console.error(`\n Tiles data is not defined`);
        if (!this.data[x]?.[y]) return console.error(`\n Error to set terrain, inbalid position`);
        this.data[x][y].terrainId = id
    }

    remove() {
        this.data = [];
    }
}