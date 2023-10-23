import * as THREE from 'three';

function newMesh(geometry, color) {
    const material = new THREE.MeshLambertMaterial({ color });
    return new THREE.Mesh(geometry, material);
}

export default {
    'france': ({x, y}, data) => {
        const mesh = newMesh(new THREE.BoxGeometry(1,1,1), 0x33C7FF)
        mesh.userData = { id: 'france', x, y };
        mesh.position.set(x, -0.5, y);
        return mesh;
    },
    'england': ({x, y}, data) => {
        const mesh = newMesh(new THREE.BoxGeometry(1,1,1), 0xFF5733)
        mesh.userData = { id: 'england', x, y };
        mesh.position.set(x, -0.5, y);
        return mesh;
    }
}

