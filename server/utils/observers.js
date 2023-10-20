
export default class Observer {

    constructor() {
        this.observers = {}
    }

    subscribe(subscribeId, observerFunction) {

        if (!this.observers[subscribeId]) this.observers[subscribeId] = [];
        this.observers[subscribeId].push(observerFunction)
    }
    
    unsubscribe(subscribeId) {
        if (this.observers[subscribeId]) delete this.observers[subscribeId];
    }

    notifyPlayers(subscribeId, command) {

        if (!this.observers[subscribeId]) {
            console.error(`\n Error to get observer: subscribeId: ${subscribeId} is not valid`);
            return;
        }
    
        for (let observerFunction of this.observers[subscribeId]) {
            
            if (typeof observerFunction != 'function') {
                console.error(`\n observer is not a function, subscribeId: ${subscribeId}`);
                return;
            }

            observerFunction(command);
        }
    }
}