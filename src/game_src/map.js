import { createAssetInstance } from "./assets";
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js'

export default class Map {

/*
*   mapData: {
*       {
*           x, 
*           y, 
*           owner, 
*           terrainId, 
*           troop
*       }
*   }
*/

    map = {};
    terrain = [];
    
    // troops placed
    troops = [];

    constructor(mapData) {

        // add tiles in scene
        this.mixers = [];
        this.map = mapData;

        this.needUpdateMixers = false
        this.TWEEN = TWEEN

        const scene = window.sceneClass.scene
        scene.clear();

        let terrain = [];
        this.troops = [];

        for (let x = 0; x < mapData.length; x++) {
            const column = [];
            for (let y = 0; y < mapData.length; y++) {
                const mesh = createAssetInstance(mapData[x][y].terrainId, x, y);
                scene.add(mesh);
                column.push(mesh);
            }
            terrain.push(column);
            this.troops.push([...Array(mapData.length)]);
        }

        window.sceneClass.setupLights();
    }

    update() {

        const scene = window.sceneClass.scene
        const mapData = this.map

        for (let x = 0; x < mapData.length; x++) {
            for (let y = 0; y < mapData.length; y++) {

                const tile = mapData[x][y];
                const existingTroopMesh = this.troops[x][y];

                if (!tile.troop && existingTroopMesh) {
                    scene.remove(existingTroopMesh);
                    this.troops[x][y] = undefined;
                }

                if (tile.troop && tile.troop.updated) {
                    scene.remove(existingTroopMesh);
                    createAssetInstance(tile.troop.id, x, y, tile.troop, (troop, mixerAnimation) => {
                        
                        scene.add(troop.mesh);
                        
                        this.tween = tween
                        
                        this.mixers.push(mixerAnimation);

                        console.log(this.mixers);
                        
                        troop.deleteAnimation = () => {
                            troop.stopAnimation();
                        }
                        
                        troop.playRunAnimation()
                        

                        new TWEEN.Tween(monkey.position)
                        .to(
                            { x: 8, z: 8 },
                            500
                        ).start()

                        setTimeout(() => {
                            this.needUpdateMixers = true
                        }, 1000)

                        this.needUpdateMixers = true
                        this.troops[x][y] = troop
                    });

                    tile.troop.updated = false;
                }
            }
        }

    }

    selectTroop(x, y) {
        if (!this.map[x]) {
            console.error('map "x" is invalid');
        };

        if (!this.map[y]) {
            console.error('map "y" is invalid');
        };

        return this.map[x][y].troop;
    }

    validMapPosition(x, y) {

        if (!this.map[x] || !this.map[x][y]) {
            console.error(`\n tile in x: ${x} y: ${y} not exists`);
            return false;
        }

        return true;
    }

    placeTroop(data) {

        const newTroop = !data?.newTroop ? null : data.newTroop;

        if (!newTroop) {
            console.error(`Error to place new troop: ${newTroop}, data: ${data}`);
            return;
        }

        if (!newTroop.pos) {
            console.error(`Troop position is not valid: ${newTroop.pos}, newTroop: ${newTroop}`);
            return;
        }

        const { x, y } = newTroop.pos
        if (!this.validMapPosition(x, y)) return;

        this.map[x][y].troop = newTroop

        this.update();
    }

    removeTroop(data) {

        if (!data.pos) {
            console.error(`error to recive position from server`);
            return;
        }

        const { x, y } = data.pos;

        if (!this.validMapPosition(x, y)) return;

        if (!this.selectTroop(x, y)) {
            console.error(`troop was already deleted`);
            return;
        }

        this.map[x][y].troop = undefined;

        this.update();
    }

    deleteMap() {
        const scene = window.sceneClass.scene
        scene.clear();
    }
}
