import * as THREE from "three";
import * as Stats from 'stats.js';

export default class Scene {

    constructor() {
        this.clock = new THREE.Clock();

        const gameWindow = window.gameWindow;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x777777);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        gameWindow.appendChild(renderer.domElement);

        this.scene = scene;
        this.renderer = renderer;
        
        const stats = new Stats();
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
        this.stats = stats;
        
        window.addEventListener('resize', () => {
            renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight + 1);
        });
    }

    setupLights() {
        const sun = new THREE.DirectionalLight(0xffffff, 2)
        sun.position.set(10, 20, 20);
        sun.castShadow = true;
        sun.shadow.camera.left = -10;
        sun.shadow.camera.right = 10;
        sun.shadow.camera.top = 0;
        sun.shadow.camera.bottom = -10;
        sun.shadow.mapSize.width = 1024;
        sun.shadow.mapSize.height = 1024;
        sun.shadow.camera.near = 10;
        sun.shadow.camera.far = 50;
        this.scene.add(sun);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        const helper = new THREE.CameraHelper(sun.shadow.camera);
        this.scene.add(helper);
    }

    mixers = []

    updateMixers(newMixers) {
        this.mixers = newMixers;
    }

    updateTween(tween) {
        this.tween = tween
    }

    render() {

        this.renderer.setAnimationLoop(() => {
            const delta = this.clock.getDelta()

            for (const mixer of this.mixers) {
                //sbcode.net/threejs/tween-animation-mixer/
                if (!mixer?.update) {
                    // console.log(mixer, mixer.update);
                    continue
                };

                mixer.update(delta);
            }

            if (this.tween) this.tween.update();

            this.stats.update();
            this.renderer.render(this.scene, window.cameraClass.camera);
        })
    }

    stopRender() {
        this.renderer.setAnimationLoop(null);
    }
}