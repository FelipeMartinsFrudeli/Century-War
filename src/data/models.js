export default {
    'knight': () => {
        return {
            size: 1,
            path: 'assets/characters/GLTF/Warrior.glb',
            mapTexturePath: 'assets/characters/Textures/Warrior_Texture.png',
            animations: {
                run: ['Run'],
                idle: ['Idle'],
                attack: ['Attack1']
            }
        }
    },
    'rogue': () => {
        return {
            size: 1,
            path: 'assets/characters/GLTF/Rogue.glb',
            mapTexturePath: 'assets/characters/Textures/Rogue_Texture.png',
            animations: {
                run: ['Run'],
                idle: ['Idle', 'Idle2'],
                attack: ['Attack1', 'Attack2']
            }
        }
    }
}