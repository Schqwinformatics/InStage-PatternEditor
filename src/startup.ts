import ConfigureStore from './configureStore';

import { Store } from 'redux';

export class Startup {

    public static configureStore(): Store<{}> {
        let store = ConfigureStore();

        return store;
    }
}