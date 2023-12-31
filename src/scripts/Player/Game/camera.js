import * as THREE from "three";

export default class PlayerCamera {

    // LEFT_MOUSE_BTN = 0;
    // MIDDLE_MOUSE_BTN = 1;
    // RIGHT_MOUSE_BTN = 2;

    MIN_CAMERA_RADIUS = 8;
    MAX_CAMERA_RADIUS = 16;
    MIN_CAMERA_ELEVATION = 30;
    MAX_CAMERA_ELEVATION = 180;

    ROTATION_SENSITIVITY = 0.5;
    ZOOM_SENSITIVITY = 0.02;
    PAN_SENSITIVITY = -0.01;

    isLeftMouseDown = false;
    isRightMouseDown = false;
    isMiddleMouseDown = false;

    cameraRadius = 6;
    cameraElevation = 80;

    constructor(canvas, startPosX = 16, cameraAzimuth = 180) {

        this.cameraAzimuth = cameraAzimuth
        this.cameraOrigin = new THREE.Vector3(startPosX, 0, 12);
        this.RADIAN = (Math.PI / 360);
        this.Y_AXIS = new THREE.Vector3(0, 1, 0);

        this.cameraRadius = (this.MIN_CAMERA_RADIUS + this.MAX_CAMERA_RADIUS) / 2;

        // const canvas = document.getElementById(gameWindow);
        const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 10000);
        
        camera.position.add(this.cameraOrigin);
        camera.lookAt(this.cameraOrigin);
        
        window.addEventListener('resize', () => {
            camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
            camera.updateProjectionMatrix();
        })

        window.onmousedown = this.onMouseDown.bind(this);
        window.onmousemove = this.onMouseMove.bind(this);
        window.onmouseup = this.onMouseUp.bind(this);

        window.ontouchstart = this.onTouchStart.bind(this);
        window.ontouchmove = this.onTouchMove.bind(this);
        window.ontouchend = this.onTouchEnd.bind(this);

        this.camera = camera

        this.updateCameraPosition();
    }

    disconnectCameraEvents() {
        window.onmousedown = () => {};
        window.onmousemove = () => {};
        window.onmouseup = () => {};

        window.ontouchstart = () => {};
        window.ontouchmove = () => {};
        window.ontouchend = () => {};
    }

    updateCameraPosition() {
        let cameraRadius = this.cameraRadius;
        let cameraAzimuth = this.cameraAzimuth;
        let cameraElevation = this.cameraElevation;
        let RADIAN = this.RADIAN;

        this.camera.position.x = cameraRadius * Math.sin(cameraAzimuth * RADIAN) * Math.cos(cameraElevation * RADIAN);
        this.camera.position.y = cameraRadius * Math.sin(cameraElevation * RADIAN);
        this.camera.position.z = cameraRadius * Math.cos(cameraAzimuth * RADIAN) * Math.cos(cameraElevation * RADIAN);
        
        this.camera.position.add(this.cameraOrigin);

        this.camera.lookAt(this.cameraOrigin);
        this.camera.updateMatrix();
    }


    prevMouseX = 0;
    prevMouseY = 0;

    onMouseDown(event) {

        this.prevMouseX = event.clientX;
        this.prevMouseY = event.clientY;

        if (event.button === 0) {
            this.isLeftMouseDown = true;
        }
        if (event.button === 1) {
            this.isMiddleMouseDown = true;
        }
        if (event.button === 2) {
            this.isRightMouseDown = true;
        }
    }

    onMouseUp(event) {
        if (event.button === 0) {
            this.isLeftMouseDown = false;
        }
        if (event.button === 1) {
            this.isMiddleMouseDown = false;
        }
        if (event.button === 2) {
            this.isRightMouseDown = false;
        }
    }

    onMouseMove(event) {

        const deltaX = (event.clientX - this.prevMouseX);
        const deltaY = (event.clientY - this.prevMouseY);

        if (this.isRightMouseDown) {
            this.cameraAzimuth += -(deltaX * this.ROTATION_SENSITIVITY);
            this.cameraElevation += (deltaY * this.ROTATION_SENSITIVITY);
            this.cameraElevation = Math.min(this.MAX_CAMERA_ELEVATION, Math.max(this.MIN_CAMERA_ELEVATION, this.cameraElevation))
            this.updateCameraPosition();
        }

        if (this.isMiddleMouseDown) {
            this.cameraRadius += (deltaY * this.ZOOM_SENSITIVITY);
            this.cameraRadius = Math.min(this.MAX_CAMERA_RADIUS, Math.max(this.MIN_CAMERA_RADIUS, this.cameraRadius));
            this.updateCameraPosition();
        }

        if (this.isLeftMouseDown) {
            const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(this.Y_AXIS, this.cameraAzimuth * Math.PI / 360);
            const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(this.Y_AXIS, this.cameraAzimuth * Math.PI / 360);

            this.cameraOrigin.add(forward.multiplyScalar(this.PAN_SENSITIVITY * deltaY));
            this.cameraOrigin.add(left.multiplyScalar(this.PAN_SENSITIVITY * deltaX));
            this.updateCameraPosition();
        }

        this.prevMouseX = event.clientX;
        this.prevMouseY = event.clientY;
    }

    isTouchDown = false;
    prevTouchX = 0;
    prevTouchY = 0;

    onTouchStart(event) {
        let touch = event.touches[0]
        
        this.prevTouchX = touch.clientX;
        this.prevTouchY = touch.clientY;

        this.isTouchDown = true;

        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }

    onTouchEnd() {
        this.isTouchDown = false;
    }

    onTouchMove(event) {

        let touch = event.touches[0]
        
        const deltaX = (touch.clientX - this.prevTouchX);
        const deltaY = (touch.clientY - this.prevTouchY);
        
        if (this.isTouchDown) {

            const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(this.Y_AXIS, this.cameraAzimuth * Math.PI / 360);
            const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(this.Y_AXIS, this.cameraAzimuth * Math.PI / 360);

            this.cameraOrigin.add(forward.multiplyScalar(-0.04 * deltaY));
            this.cameraOrigin.add(left.multiplyScalar(-0.04 * deltaX));
            this.updateCameraPosition();
        }
        
        this.prevTouchX = touch.clientX;
        this.prevTouchY = touch.clientY;
    }
}