import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

THREE.Cache.enabled = true ;

const loader = new GLTFLoader()
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
loader.setDRACOLoader( dracoLoader );


const geometry = new THREE.BoxGeometry(1,1,1);

const loadedModels = {}

const assets = {
    'france': (x, y, data) => {
        const material = new THREE.MeshLambertMaterial({ color: 0x33C7FF });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: 'france', x, y };
        mesh.position.set(x, -0.5, y);
        mesh.receiveShadow = true;
        return mesh;
    },
    'england': (x, y, data) => {
        const material = new THREE.MeshLambertMaterial({ color: 0xFF5733 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: 'england', x, y };
        mesh.position.set(x, -0.5, y);
        mesh.receiveShadow = true;
        return mesh;
    },
    'knight': (x, y, data, callback) => {

        let lastAction // THREE.AnimationAction

        // THREE.AnimationAction
        const setAction = (toAction) => {
            if (toAction != activeAction) {
                if (lastAction) lastAction.stop()
                
                lastAction = activeAction
                activeAction = toAction

                lastAction.fadeOut(0.2)
                activeAction.reset()
                activeAction.fadeIn(0.2)
                activeAction.play()
            }
        }

        const animations = {
            playDeathAnimation: function() {
                setAction(animationActions[0])
            },
            default: function () {
                setAction(animationActions[0])
            },
            running: function () {
                setAction(animationActions[3])
            },
        }

        // '/assets/rpg-characters/GLTF/Warrior.glb'
        
        loader.load('/assets/rpg-characters/GLTF/Run.glb', function (gltf) {

            let mesh = gltf.scene;

            mesh.traverse((node) => {
                if (node.isMesh) {
        
                    const texture = new THREE.TextureLoader().load('/assets/rpg-characters/Textures/Warrior_Texture.png')
                    node.material = new THREE.MeshLambertMaterial({})
                }
            })

            mesh.scale.set(1, 1, 1)
            mesh.position.set(x, 0, y)
            
            let lookDirectionX = x >= 8 ? 0 : 16
            mesh.lookAt(lookDirectionX, 0, y)

            console.log('position', lookDirectionX, x);

            // 'CharacterArmature|CharacterArmature|Death'

            let mixer = new THREE.AnimationMixer(mesh);
            const clip = THREE.AnimationClip.findByName(gltf.animations, 'Run')
            console.log(clip, 'clip');
            const action = mixer.clipAction(clip);

            let troop = {}
            troop.mesh = mesh
            troop.stopAnimtion = () => {
                action.stop();
            }

            troop.playRunAnimation = () => {
                action.play();
            }

            if (typeof callback == 'function') callback(troop, mixer)
            
            loadedModels['knight'] = mesh;
        },
        (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
        (error) => console.log(error))
        // return mesh;
    },
    'gray-block': (x, y, data) => {
        const material = new THREE.MeshLambertMaterial({ color: 0x777777 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: 'residential', x, y };
        mesh.scale.set(1, data.height, 1);
        mesh.position.set(x, data.height / 2, y);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        return mesh;
    }
}

export function createAssetInstance(assetId, x, y, data, callback) {

    if (assetId in assets) {
        return assets[assetId](x, y, data, callback);
    } else {
        console.warn(`Asset id ${assetId} is not found.`);
        return undefined;
    }
}

