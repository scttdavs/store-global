export const createStore = (initialState: object) => {
    let state = {};
    let callbacks: Callbacks = {
        get: [],
        set: [],
        reset: [],
        clear: []
    };

    const setState = (obj: object) => {
        Object.keys(obj).forEach(key => {
            let value = obj[key];
            Object.defineProperty(state, key, {
                enumerable: true,
                configurable: true,
                get() {
                    callbacks.get.forEach(callback => callback(value))
                    return value
                },
                set(newValue) {
                    if (newValue !== value) {
                        value = newValue;
                        callbacks.set.forEach(callback => callback(key, value))
                    }
                    return value
                }
            })
        })
    }
    setState(initialState)

    const clear = () => {
        Object.keys(state).forEach(key => {
            delete state[key]
        })
        callbacks.clear.forEach(callback => callback())
    }
    const reset = () => {
        setState(initialState)
        callbacks.reset.forEach(callback => callback())
    }
    const get = key => state[key]
    const set = (key, value) => { return state[key] = value }
    const on = (eventName: string, callback) => {
        callbacks[eventName].push(callback);

        // return function to unsubscribe
        return () => {
            callbacks[eventName] = callbacks[eventName].filter(cb => cb !== callback)
        }
    };
    const onChange = (propName: string, callback: (value: any) => {}) => {
        const unSet = on('set', (key: string, newValue) => {
            if (key === propName) callback(newValue)
        })
        const unCallback = () => callback(initialState[propName])
        const unReset = on('reset', unCallback)
        const unClear = on('clear', unCallback)

        // return function to unsubscribe
        return () => {
            unSet();
            unReset();
            unClear();
        }
    }
    
    // TODO throw if they try to set a new field

    const use = config => {
        ['get', 'set', 'reset', 'clear'].forEach(eventName => {
            on(eventName, config[eventName])
        });
    }

    return {
        state,
        reset,
        clear,
        get,
        set,
        use,
        on,
        onChange
    };
}
