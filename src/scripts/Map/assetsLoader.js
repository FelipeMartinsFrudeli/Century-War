import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import randomId from '../utils/idGenerator';
import models from '../../data/models';


export default class AssetsLoader {
    
    constructor() {
        THREE.Cache.enabled = true;

        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
        this.loader.setDRACOLoader(this.dracoLoader);

        this.groups = {};
    }

    async loadModel(name) {

        if (!models[name]) return console.error(`model ${name} is not a valid model`);
        
        const model = models[name]();
        const modelId = `${name}-${randomId()}`;

        const gltf = await this.loader.loadAsync(`../../${model.path}`)

        if (gltf) {
            const mesh = gltf.scene;

            mesh.traverse((node) => {
                if (node.isMesh) {
                    const mapTexture = new THREE.TextureLoader().load(`../../${model.mapTexturePath}`)
                    node.material = new THREE.MeshLambertMaterial({
                        map: mapTexture
                    })
                }
            })

            const size = model.size;
            mesh.scale.set(size, size, size);

            let mixer = new THREE.AnimationMixer(mesh);
            var actions = {};

            this.groups[modelId] = gltf;

            for (const animation in model.animations) {

                const animationsArray = model.animations[animation];
                actions[animation] = [];

                for (const name of animationsArray) {
                    const clip = THREE.AnimationClip.findByName(gltf.animations, name);
                    const action = mixer.clipAction(clip);

                    actions[animation].push({ clip, action });
                }
            }
            
            this.groups[modelId].actions = actions
            this.groups[modelId].mixer = mixer;
        }

        return this.groups[modelId];
    }

    
}