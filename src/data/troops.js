import randomId from "../scripts/utils/idGenerator";

export default {
    'knight': (owner) => {
        return {
            id: 'knight',
            name: 'cavalheiro',
            owner: owner,
            damage: 100,
            speed: 5,
            life: 150,
            updated: true,
            counter: 4,
            update: function() {
                this.updated = false;
            },
            modelId: `knight-${randomId()}`,
        }
    },
    'rogue': (owner) => {
        return {
            id: 'rogue',
            name: 'ladrão',
            owner: owner,
            damage: 100,
            speed: 8,
            life: 80,
            updated: true,
            counter: 4,
            update: function() {
                this.updated = false;
            },
            modelId: `rogue-${randomId()}`,
        }
    },
}