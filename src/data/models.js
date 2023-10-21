export default {
    'knight': () => {
        return {
            size: 1,
            path: '/assets/characters/GLTF/Knight.glb',
            animations: {
                run: ['Run'],
                idle: ['Idle'],
                attack: ['Attack1']
            }
        }
    },
    'warrior': () => {
        return {
            size: 1,
            path: '/assets/characters/GLTF/Warrior.glb',
            animations: {
                run: ['Run'],
                idle: ['Idle', 'Idle2'],
                attack: ['Attack1', 'Attack2']
            }
        }
    }
}