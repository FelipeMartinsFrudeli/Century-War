import * as THREE from "three";
import * as Stats from 'stats.js';
import $ from 'jquery';

export default class PlayerScene {

    constructor(canvas) {

        this.canvas = canvas;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x777777);
        this.scene = scene;
        
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer = renderer;

        window.addEventListener('resize', function onResize() {
            if (!renderer) {
                window.removeEventListener('resize', onResize)
                return console.log(`\n Error to resize renderer removed`);
            }
            renderer.setSize(canvas.offsetWidth, canvas.offsetHeight + 1);
        });

        canvas.appendChild(renderer.domElement);

        
        this.stats = new Stats();
        this.stats.showPanel(0);
        // document.body.appendChild(this.stats.dom);
        
        this.clock = new THREE.Clock();
    }

    setupLights() {
        const sun = new THREE.DirectionalLight(0xffffff, 2)
        sun.position.set(10, 40, 10);
        sun.castShadow = true;

        sun.shadow.mapSize.width = 1024; 
        sun.shadow.mapSize.height = 1024;

        sun.shadow.camera.bottom = -40
        sun.shadow.camera.left = -40
        sun.shadow.camera.right = 40
        sun.shadow.camera.top = 0
        sun.shadow.camera.near = 10
        sun.shadow.camera.far = 100
        
        this.scene.add(sun);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    }

    mixers = []
    tweens = []

    updateMixers(newMixers) {
        this.mixers = newMixers;
    }

    updateTween(tweens) {
        this.tweens = tweens
    }

    render(camera) {

        $(`#${this.canvas.id} canvas`).fadeIn(50).css('z-index', 5);

        this.renderer.setAnimationLoop(() => {
            const delta = this.clock.getDelta()

            for (const mixer of this.mixers) {
                if (!mixer?.update) {
                    continue
                };
                mixer.update(delta);
            }

            for (const tween of this.tweens) {
                if (tween.update) tween.update();
            }

            // this.stats.update();
            this.renderer.render(this.scene, camera);
        })
    }

    stopRender() {
        this.mixers = []
        this.tweens = []
        this.renderer.setAnimationLoop(null);
        $(`#${this.canvas.id} canvas`).fadeOut(50).css('z-index', 0);
    }
}