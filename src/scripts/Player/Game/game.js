import PlayerCamera from './camera';
import SelectObject from './selectObject';

export default class PlayerGame {

    constructor(data) {

        this.observers = {
            removeGame: []
        };

        this.gameWindow = data.gameWindow;
        this.playerId = data.playerId;
        this.Scene = data.playerScene;
        this.gameInstance = data.gameInstance;
        this.clientMap = data.clientMap;
        
        // Set camera position
        const teamIndex = this.gameInstance.players.indexOf(this.playerId)
        const startPosX = teamIndex === 0 ? 18 : 6
        const cameraAzimuth = teamIndex === 0 ? 180 : -180
        
        this.Camera = new PlayerCamera(this.gameWindow, startPosX, cameraAzimuth);
        
        this.Scene.scene.add(this.Camera.camera)
        this.playerSelectObjects = new SelectObject(this.Camera.camera, this.Scene);

        this.onRemoveGame(() => {

            this.Scene.updateMixers([])

            this.clientMap.removeUpdateMixerEvents();
            this.Scene.stopRender();

            this.playerSelectObjects.removeAllListeners();
            this.playerSelectObjects.removeClickEvent();

            this.Scene.scene.remove(this.Camera.camera)
            this.Camera.disconnectCameraEvents();
            this.Camera = undefined;

            for(let i = this.Scene.scene.children.length - 1; i >= 0; i--) { 
                const obj = this.Scene.scene.children[i];
                this.Scene.scene.remove(obj); 
           }
        })

        const loadEvent = () => {
            this.Scene.render(this.Camera.camera);
            this.clientMap.removeListener(loadEvent);

            this.clientMap.onUpdateMixers(() => {
                this.Scene.updateMixers(this.clientMap.mixers);
                this.Scene.updateTween(this.clientMap.tweens)
                // this.Scene.updateBoxHelper(this.clientMap.BoxHelper);
            })
        }

        this.clientMap.onLoadMap(loadEvent);
    }

    getMapInstance() {
        if (!this.gameInstance?.map?.mapInstance) return console.error(`\n map instance do not exists`);
        return this.gameInstance.map.mapInstance
    }
 
    onRemoveGame(fn) {
        this.observers.removeGame.push(fn);
        return fn;
    }

    removeListener(fn) {
        this.observers.removeGame = this.observers.removeGame.filter((observer) => observer != fn);
    }

    removeGame(params) {
        for (const observer of this.observers.removeGame) {
            if (typeof observer === 'function') {
                observer(params)
                this.removeListener(observer)
            }
        }
    }

}