import { createStore, Store } from 'redux';
import RootReducer, { RootState } from './components/shared';

// configure store with thunk middleware that injects services into actions
export default function ConfigureStore(): Store<{}> {

    const initialState = getInitialState();
    const store = createStore(RootReducer, initialState);

    return store;
}

function getInitialState(): Partial<RootState> {

    return {
        VisualEditorReducer: {
            edges: [],
            nodes: [],
        },
        TextualEditorReducer: {
            currentTextParsed: true,
            edges: [],
            nodes: [],
            text: "",
            tryParseCounter: 0
        }
    };
}