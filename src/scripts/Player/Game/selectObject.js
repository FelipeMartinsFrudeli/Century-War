import * as THREE from "three";

export default class SelectObject {
    
    constructor(camera, Scene) {

        this.observers = [];

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.clickEvent = (event) => {
            this.mouse.x = (event.clientX / Scene.renderer.domElement.clientWidth) * 2 - 1;
            this.mouse.y = 1 - (event.clientY / Scene.renderer.domElement.clientHeight) * 2;
            
            this.raycaster.setFromCamera(this.mouse, camera);

            let intersect = this.raycaster.intersectObjects(Scene.scene.children, false);
            
            if (intersect.length > 0) {
                if (typeof intersect[0]?.object?.material?.emissive?.setHex != 'function') return
                
                if (this.selectedObject && this.selectedObject.type === "Mesh") {
                    this.selectedObject.material.emissive.setHex(0);
                };
                
                this.selectedObject = intersect[0].object;

                if (this.selectedObject.type === "Mesh") {
                    this.selectedObject.material.emissive.setHex(0x55aaaa)
                    this.selectObeject(this.selectedObject);
                }
            }
        }

        window.addEventListener('click', this.clickEvent)
    }

    removeClickEvent() {
        window.removeEventListener('click', this.clickEvent)
    }

    selectObeject(selectedObject) {
        for (const observer of this.observers) {
            if (typeof observer === 'function') observer(selectedObject);
        }
    }

    onSelectObject(fn) {
        this.observers.push(fn);
        return fn;
    }

    removeListener(fn) {
        this.observers = this.observers.filter((observer) => observer != fn);
    }

    removeAllListeners() {
        this.observers = [];
    }
}