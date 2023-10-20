import * as THREE from "three";
import { createAssetInstance } from "./assets";
import Camera from "./camera";
import Input from "./input";
import Scene from "./scene";
import initScreenAlert from "./screenAlert";
import Map from "./map";

export default class Game {
    
    onObjectSelected = null;
    selectedObject = null;
    hostId = null;

    constructor() {

        initScreenAlert();

        const gameWindow = document.getElementById('render-target');
        window.gameWindow = gameWindow;

        const sceneClass = new Scene();
        window.sceneClass = sceneClass;
        this.sceneClass = sceneClass;

        const cameraClass = new Camera();
        cameraClass.updateCameraPosition();
        sceneClass.scene.add(cameraClass.camera)
        window.cameraClass = cameraClass;



        // connect inputs
        const input = new Input();

        // ".bind()" send "this" context to function -- CAMERA INPUTS
        input.mousedown(cameraClass.onMouseDown.bind(cameraClass))
        input.mousemove(cameraClass.onMouseMove.bind(cameraClass))
        input.mouseup(cameraClass.onMouseUp.bind(cameraClass))

        input.touchstart(cameraClass.onTouchStart.bind(cameraClass))
        input.touchmove(cameraClass.onTouchMove.bind(cameraClass))
        input.touchend(cameraClass.onTouchEnd.bind(cameraClass))
        
        window.addEventListener('contextmenu', (e) => e.preventDefault(), false);
    }

    setHostId(id) {
        this.hostId = id
    }

    currentMapClass = null;
    currentMixers = []

    loadMap(mapData) {
        this.sceneClass.stopRender();

        if (this.currentMapClass) {
            this.currentMapClass.deleteMap();
        }

        const mapClass = new Map(mapData);
        this.currentMapClass = mapClass;

        this.sceneClass.render();

        const update = () => {

            if (!mapClass) return

            console.log(mapClass.needUpdateMixers);

            if (mapClass.needUpdateMixers) {
                this.sceneClass.updateMixers(mapClass.mixers);
                this.sceneClass.updateTween(mapClass.tween)
                mapClass.needUpdateMixers = false
            }

            requestAnimationFrame(update)
        }

        update();
    }

    updateMap(updateType, data) {

        if (!this.currentMapClass) {
            console.error(`currentMapClass is not defined`);
            return;
        }

        // placeTroop
        if (!this.currentMapClass[updateType]) {
            console.error(`Update type: ${data.updateMap} not finded in game object, data: ${data}`);
            return;
        }

        this.currentMapClass[updateType](data);
    }

    deleteMap() {
        console.log('delete map');
        // console.dir(this.currentMapClass);

        if (this.currentMapClass) {
            this.currentMapClass.deleteMap();
        }

        this.sceneClass.stopRender();
    }

    selectTool(toolAction, troopName) {
        this.toolAction = toolAction
        this.troopName = troopName
    }

    onPlaceObjects(callback) {

        this.connectSelectObjects();

        this.onObjectSelected = (selectedObject) => {
            
            if (!this.toolAction) {
                console.error(`tool action is not valid`);
                return;
            }

            if (!this.troopName) {
                console.error(`troop name is not valid`);
                return;
            }

            if (!this.currentMapClass?.map || !selectedObject) {
                console.error('map or selectObject is not valid');
                return;
            };
            
            let { x, y } = selectedObject.userData;
            const troop = this.currentMapClass.selectTroop(x, y)

            if (this.toolAction === 'remove') {
                
                callback({ toolAction: this.toolAction, pos: {x, y} });
                
            } else if (!troop) {
                callback({ toolAction: this.toolAction, pos: {x, y}, troopName: this.troopName });
            }
        }

    }

    // tile.troop = undefined;
    // scene.update(map);

    // tile.troop = buildingFactory[activeToolId]();
    // scene.update(map);

    connectSelectObjects() {
        const input = new Input();

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        input.click((event) => {
            if (event.button === 0 && window.canvasClick !== false) {
                mouse.x = (event.clientX / window.sceneClass.renderer.domElement.clientWidth) * 2 - 1;
                mouse.y = 1 - (event.clientY / window.sceneClass.renderer.domElement.clientHeight) * 2;
        
                // console.log(mouse);

                raycaster.setFromCamera(mouse, window.cameraClass.camera);
        
                let intersect = raycaster.intersectObjects(window.sceneClass.scene.children, false);

                if (intersect.length > 0) {
                    if (this.selectedObject && this.selectedObject.type === "Mesh") {
                        this.selectedObject.material.emissive.setHex(0);
                    };
                    
                    this.selectedObject = intersect[0].object;
                    if (this.selectedObject.type === "Mesh") {
                        this.selectedObject.material.emissive.setHex(0x55aaaa)
                        if (this.onObjectSelected) {
                            this.onObjectSelected(this.selectedObject);
                        }
                    }
    
                }
            }
        })
        
    }

    
}