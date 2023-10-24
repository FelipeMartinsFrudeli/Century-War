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
        this.enemys = [];
        
        this.observers = {};


        this.tweens = [];
        this.mixers = [];
        this.groupsModels = {};
        this.assetsLoader = new AssetsLoader()

        this.updateMapMethods = {
            'placeTroop': async (data, players, playerId, socketCallback) => {

                const troop = data.newTroop
                if (!troop) return console.error(`newTroop data is ${troop}`);
                this.groupsModels[troop.modelId] = {}
                this.groupsModels[troop.modelId].loadedTroop = false
                
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

                model.modelId = troop.modelId
                model.initialPosition = {x,y}
                
                this.mixers.push(model.mixer)
                
                
                if(!this.getMapData()) return;
                this.troops[x][y] = troop
                this.groupsModels[troop.modelId] = model
                this.groupsModels[troop.modelId].loadedTroop = false
                
                if (playerId != troop.owner) {
                    this.enemys[y] = troop
                    this.enemys[y].pos = {x, y}
                }

                this.troops[x][y].remove = () => {
                    if (typeof this.groupsModels[troop.modelId] == 'undefined') return
                    const model = this.groupsModels[troop.modelId]
                    if (model.scene) playerScene.scene.remove(model.scene);
                    if (model.tween) {
                        this.tweens = this.tweens.filter((tween) => tween != model.tween)
                        this.updateMixersEvent();
                    }
                    if (model.tween?.stop) model.tween.stop();
                }

                this.troops[x][y].move = () => {
                    if (typeof this.groupsModels[troop.modelId] == 'undefined') return
                    const model = this.groupsModels[troop.modelId]

                    // console.log(model, 'model');

                    const tweenAnimation = new TWEEN.Tween(model.scene.position)
                        .to({ x: direction, z: y }, 3000).start()
                        .onStart(() => {
                            model.actions.run[0].action.play();
                            model.currentAnimation.action.stop();
                            this.groupsModels[troop.modelId].currentAnimation = model.actions.run[0]
                            this.groupsModels[troop.modelId].tween = tweenAnimation
                        })
                        .onUpdate(() => {
                            
                            if (playerId == troop.owner) {
                                if (!model.loadedTroop) return console.log('not loaded troop');
                                
                                const detectCollision = (axis) => {
                                    if (this.enemys[axis]) {
                                        const enemyModel = this.groupsModels[this.enemys[axis].modelId]
                                        if (!enemyModel) return;
                                        if (!enemyModel.loadedTroop) return console.log('enemy not loaded troop');
    
                                        // if (enemyModel.scene.x )
                                        let distance = enemyModel.scene.position.x - model.scene.position.x
                                        if (typeof distance != 'number') return console.error('distance is NaN');
                                        
                                        if (distance < 0) {
                                            distance *= (-1)
                                        }
                                        
                                        if (distance < 2) {
                                            tweenAnimation.stop();
                                            this.tweens = this.tweens.filter((tween) => tween != model.tween && tween != enemyModel.tween)
                                            this.updateMixersEvent();
    
                                            enemyModel.scene.lookAt(model.scene.position)
                                            enemyModel.currentAnimation.action.stop();
                                            enemyModel.actions.attack[0].action.play();
    
                                            model.scene.lookAt(enemyModel.scene.position)
                                            model.currentAnimation.action.stop();
                                            model.actions.attack[0].action.play();
    
                                            console.log(this.enemys[axis].modelId, troop.modelId)

                                            let counter = 0
                                            const damage = setInterval(() => {
                                                if (!this.enemys[axis]?.counter) {
                                                    if (damage) clearInterval(damage)
                                                }
                                                if (!counter) {
                                                    tweenAnimation.stop()
                                                    clearInterval(damage)
                                                    if (!enemyModel?.modelId || !model?.modelId) return
                                                    if (enemyModel.modelId != this.enemys[axis]?.modelId) return console.log(`model id is other`)
                                                    if (model.modelId != troop.modelId) return console.log(`model id is other`);
                                                    socketCallback('remove-troop', { pos: enemyModel?.initialPosition, modelId: enemyModel.modelId })
                                                    socketCallback('remove-troop', { pos: model?.initialPosition, modelId: model.modelId })
                                                    return
                                                }
                                                if (counter >= this.enemys[axis].counter) {
                                                    tweenAnimation.stop()
                                                    clearInterval(damage)
                                                    if (!enemyModel?.modelId || !model?.modelId) return
                                                    if (enemyModel.modelId != this.enemys[axis]?.modelId) return console.log(`model id is other`)
                                                    if (model.modelId != troop.modelId) return console.log(`model id is other`);
                                                    socketCallback('remove-troop', { pos: enemyModel?.initialPosition, modelId: enemyModel.modelId })
                                                    socketCallback('remove-troop', { pos: model?.initialPosition, modelId: model.modelId })
                                                }
                                                counter++
                                            }, 1000)
                                        }
                                    };
                                }
                                
                                detectCollision(y);
                                detectCollision(y-1);
                                detectCollision(y+1);
                                detectCollision(y-2);
                                detectCollision(y+2);
                                // console.log('update', x, y, model.scene.position);
                            }
                        })
                        .onComplete(() => {
                            this.mixers = this.mixers.filter((mixer) => mixer != model.mixer)
                            
                            if (model.scene) playerScene.scene.remove(model.scene);

                            console.log("END");
                            
                            this.groupsModels[troop.modelId] = undefined
                            this.updateMixersEvent();

                            if (playerId != troop.owner) socketCallback('damage-player', { playerId, damage: troop.damage })
                        })
                
                    this.tweens.push(tweenAnimation)

                    setTimeout(() => {
                        this.groupsModels[troop.modelId].loadedTroop = true
                    }, 200)
                }

                return model
            },
            'moveTroop': (data) => {
                
                const { x, y } = data.pos;
                if (typeof x != 'number' || typeof y != 'number') return console.error(`newTroop position is not a number`);
                
                if (this.enemys[y]) this.enemys[y]
                if (typeof this.troops[x][y]?.move == 'undefined') return
                this.troops[x][y].move()
            },
            'removeTroop': (data) => {
                
                console.log(data);
                const { x, y } = data.pos;
                if (typeof x != 'number' || typeof y != 'number') return console.error(`newTroop position is not a number`);
                if (!this.troops[x]?.[y]) return console.log('already removed in position', x, y);
                
                if (this.troops[x][y]?.remove) this.troops[x][y].remove()
                if (this.enemys[y]) this.enemys[y] = undefined
                
                this.troops[x][y] = undefined;
            }
        }
    }

    removeTroopEvent() {

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

    updateMap(type, data, playersData, playerId, socketCallback) {
        if (!data) return console.error(`updateMap data is undefined`);
        if (!this.updateMapMethods[type]) return console.error(`Update map type is invalid: ${type}`);
        this.updateMapMethods[type](data, playersData, playerId, socketCallback);
        this.updateMixersEvent();
    }
}