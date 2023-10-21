
export default class Tiles {

    constructor(size) {

        let data = []

        for (let x = 0; x < size; x++) {

            const column = [];

            let team = x > size/2 ? 'france' : 'england'

            for (let y = 0; y < size; y++) {

                const tile = {
                    pos: { x, y },
                    terrainId: team
                };

                column.push(tile);
            }

            data.push(column);
        }

        this.size = size;
        this.data = data;
    }

    remove() {
        this.data = [];
    }
}