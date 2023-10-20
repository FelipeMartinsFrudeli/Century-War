export default {
    'knight': (owner) => {
        return {
            id: 'knight',
            name: 'cavalheiro',
            owner: owner,
            height: 1,
            damage: 10,
            life: 100,
            updated: true,
            update: function() {
                this.updated = false;
            }
        }
    } 
}