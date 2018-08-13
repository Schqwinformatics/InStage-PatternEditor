import { ActionTypes, UpdateTextAction, ParseAction } from './textualEditor.actions';
import { PatternEditorAction } from '../shared/patternEditorAction';

export interface TextualEditorState {
    text: string;
    nodes: vis.Node[];
    edges: vis.Edge[];
    tryParseCounter: number;
    currentTextParsed: boolean;
}

const defaultState: TextualEditorState = {
    text: "",
    nodes: [],
    edges: [],
    tryParseCounter: 0,
    currentTextParsed: true
};

export function TextualEditorReducer(state: TextualEditorState = defaultState, incomingAction: PatternEditorAction): TextualEditorState {
    switch (incomingAction.type) {
        case ActionTypes.CHANGE_TEXT: {
            const action = incomingAction as UpdateTextAction;
            const text = action.newText;

            return {
                ...state,
                text: text,
                tryParseCounter: 0,
                currentTextParsed: false
            };
        }
        case ActionTypes.PARSE: {
            const action = incomingAction as ParseAction;

            return {
                ...state,
                nodes: action.nodes,
                edges: action.edges,
                currentTextParsed: true
            };
        }
        case ActionTypes.TICK: {
            const action = incomingAction as ParseAction;

            return {
                ...state,
                tryParseCounter: state.tryParseCounter + 1,
            };
        }
        default: {
            return state;
        }
    }
}