import ground from "../../data/ground";
import AssetsLoader from "./assetsLoader";

export default class ClientMap {

    constructor(map, playerScene) {

        const mapInstance = map.mapInstance
        if (!mapInstance) return console.error(`map instance is undefined`);
        if (!mapInstance.tileInfo) return console.error(`tileInfo is undefined`);
        if (!mapInstance.tiles) return console.error(`tiles is undefined`);

        this.tileInfo = mapInstance.tileInfo
        this.tiles = mapInstance.tiles

        this.mixers = [];
        this.terrain = [];
        this.troops = [];

        this.observers = {};

        this.assetsLoader = new AssetsLoader()

        this.updateMapMethods = {
            'placeTroop': async (data, players) => {

                const troop = data.newTroop
                if (!troop) return console.error(`newTroop data is ${troop}`);
                
                const { x, y } = troop.pos;
                if (typeof x != 'number' || typeof y != 'number') return console.error(`newTroop position is not a number`);

                const model = await this.assetsLoader.loadModel(troop.id);
                if (!model) return console.error(`model load failed ${model}`);
                if (!players) return console.error(`players is ${players}`);

                const teamIndex = players.indexOf(troop.owner)
                const startPosX = teamIndex === 0 ? 12 : 13

                model.scene.position.set(x, 0, y);
                model.scene.lookAt(startPosX, 0, y);
                playerScene.scene.add(model.scene);
                
                console.log('model', model);
                model.currentAnimation = model.actions.idle[0]
                model.actions.idle[0].action.play()

                this.mixers.push(model.mixer)

                return model
            },
            'removeTroop': (data) => {

            }
        }
    }

    getMapData() {
        if (!this.tiles.data) return console.error(`Tile data is undefined`);
        return this.tiles.data
    }

    createGround(assetId, pos, data = {}) {

        if (!pos) return console.error(`position is undefined`);
        if (typeof pos.x != 'number' || typeof pos.y != 'number') {
            console.error(`Error to create asset, invalid position:`);
            console.dir(pos)
            return undefined;
        };
    
        if (assetId in ground) return ground[assetId](pos, data);
        
        console.warn(`Asset id ${assetId} is not found.`);
        return undefined;
    }

    onUpdateMixers(fn) {
        if (!this.observers.updateMixers) this.observers.updateMixers = []
        this.observers.updateMixers.push(fn);
        return fn;
    }

    updateMixersEvent() {
        if (!this.observers.updateMixers) this.observers.updateMixers = []

        for (const observer of this.observers.updateMixers) {
            if (typeof observer === 'function') observer(this.mixers)
        }
    }

    removeUpdateMixerEvents() {
        if (!this.observers.updateMixers) this.observers.updateMixers = []
        this.observers.updateMixers = []
    }

    loadMap(game) {
        if (!this.observers.loadMap) this.observers.loadMap = []

        const mapData = this.getMapData();

        const Scene = game.Scene
        Scene.scene.clear();

        this.terrain = [];
        this.troops = [];

        for (let x = 0; x < mapData.length; x++) {
            const column = [];
            for (let y = 0; y < mapData.length; y++) {
                const mesh = this.createGround(mapData[x][y].terrainId, {x, y});
                if (!mesh) return console.error(`Error to create ground, invalid mesh`);;
                Scene.scene.add(mesh);
                column.push(mesh);
            }
            this.terrain.push(column);
            this.troops.push([...Array(mapData.length)]);
        }

        Scene.setupLights();

        for (const observer of this.observers.loadMap) {
            if (typeof observer === 'function') observer(username)
        }
    }

    onLoadMap(fn) {
        if (!this.observers.loadMap) this.observers.loadMap = []
        this.observers.loadMap.push(fn);
        return fn;
    }

    removeListener(fn) {
        if (!this.observers.loadMap) this.observers.loadMap = []
        this.observers = this.observers.loadMap.filter((observer) => observer != fn);
    }    

    updateMap(type, data, playersData) {
        if (!data) return console.error(`updateMap data is undefined`);
        if (!this.updateMapMethods[type]) return console.error(`Update map type is invalid: ${type}`);
        this.updateMapMethods[type](data, playersData);
        this.updateMixersEvent();
    }
}