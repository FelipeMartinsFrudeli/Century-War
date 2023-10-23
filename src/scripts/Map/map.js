import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

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

        this.terrain = [];
        this.troops = [];
        
        this.observers = {};
        
        // this.staticCollideMesh = {}
        // this.BoxHelper = [];

        this.tweens = [];
        this.mixers = [];
        this.groupsModels = {};
        this.assetsLoader = new AssetsLoader()

        this.updateMapMethods = {
            'placeTroop': async (data, players, playerId) => {

                const troop = data.newTroop
                if (!troop) return console.error(`newTroop data is ${troop}`);
                
                const { x, y } = troop.pos;
                if (typeof x != 'number' || typeof y != 'number') return console.error(`newTroop position is not a number`);

                const loadedModel = await this.assetsLoader.loadModel(troop.id);
                const model = loadedModel.model
                
                if (!model) return console.error(`model load failed ${model}`);
                if (!players) return console.error(`players is ${players}`);
                
                const teamIndex = players.indexOf(troop.owner)
                const direction = teamIndex === 0 ? 0 : 24
                
                model.scene.position.set(x, 0, y);
                model.scene.lookAt(direction, 0, y);
                playerScene.scene.add(model.scene);
                
                // console.log('model', model);
                model.currentAnimation = model.actions.idle[0]
                model.actions.idle[0].action.play()
                
                this.mixers.push(model.mixer)
                
                if(!this.getMapData()) return;
                this.troops[x][y] = troop
                this.groupsModels[troop.modelId] = model
                
                // model.scene.hitbox = new THREE.Mesh(
                //     new THREE.BoxGeometry(4, 4, 4),
                //     new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5 })
                // );

                // const hitbox = model.scene.hitbox
                // hitbox.position.set(x, 2, y);
                // hitbox.boxCollider = new THREE.Box3().setFromObject(hitbox);

                // model.scene.hitbox.helper = new THREE.BoxHelper(hitbox, 0xff0000 );
                // const BBoxHelper = model.scene.hitbox.helper
		        // playerScene.scene.add(hitbox);
		        // playerScene.scene.add(BBoxHelper);
                // this.BoxHelper.push(BBoxHelper);


                // if (typeof this.staticCollideMesh[troop.owner] == 'undefined') this.staticCollideMesh[troop.owner] = []

                // if (playerId == troop.owner) {

                //     for(const id in this.staticCollideMesh) {
                //         if (id != playerId) {
                //             console.log(this.staticCollideMesh[id], "MESH COLLIDE ID");

                //             this.staticCollideMesh[id].some((mesh) => {
                //                 console.log(mesh.position);
                //                 if (hitbox.boxCollider.intersectsBox(mesh.boxCollider)) {
                //                     console.log(mesh, "MESH COLLIDE");
                //                 }
                //             })
                //         }
                //     }
                // }

                this.troops[x][y].move = () => {
                    if (typeof this.groupsModels[troop.modelId] == 'undefined') return
                    const model = this.groupsModels[troop.modelId]

                    console.log(model, 'model');

                    // this.tweens.push(
                    //     new TWEEN.Tween(model.scene.hitbox.position)
                    //     .to({ x: direction, z: y }, 6000).start()
                    // );
                    this.tweens.push(
                        new TWEEN.Tween(model.scene.position)
                        .to({ x: direction, z: y }, 6000).start()
                        .onStart(() => {
                            model.actions.run[0].action.play();
                            model.currentAnimation.action.stop();
                        })
                        .onUpdate(() => {
                            
                            if (playerId == troop.owner) {
                                console.log('update', model.scene.position);
                            }
                        })
                        .onComplete(() => {
                            // this.staticCollideMesh[troop.owner] = model.filter((hitbox) => hitbox != model.scene.hitbox)
                            // this.BoxHelper = this.BoxHelper.filter((helper) => helper != model.scene.hitbox.helper)
                            this.mixers = this.mixers.filter((mixer) => mixer != model.mixer)
                            
                            // playerScene.scene.remove(model.scene.hitbox.boxCollider)
                            // playerScene.scene.remove(model.scene.hitbox.helper);
                            // playerScene.scene.remove(model.scene.hitbox);
                            playerScene.scene.remove(model.scene);

                            this.groupsModels[troop.modelId] = undefined
                            this.updateMixersEvent();
                        })
                    );
                }

                setTimeout(() => {
                    if (typeof this.troops[x][y].move == 'undefined') return
                    this.troops[x][y].move()
                }, 500)
                
                // console.log(this.troops[x][y]);

                return model
            },
            'removeTroop': (data) => {

                console.log(data);
                const { x, y } = data.pos;
                if (typeof x != 'number' || typeof y != 'number') return console.error(`newTroop position is not a number`);
                if (!this.troops[x]?.[y]) return console.log('already removed in position', x, y);

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

    updateMap(type, data, playersData, playerId) {
        if (!data) return console.error(`updateMap data is undefined`);
        if (!this.updateMapMethods[type]) return console.error(`Update map type is invalid: ${type}`);
        this.updateMapMethods[type](data, playersData, playerId);
        this.updateMixersEvent();
    }
}