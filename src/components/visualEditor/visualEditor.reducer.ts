import { ActionTypes,
    AddNodeAction,
    AddEdgeAction,
    RemoveNodeAction,
    RemoveEdgeAction,
    InitializeAction,
    EditNodeLabelAction,
    EditEdgeLabelAction, 
    EditNodePositionAction} from './visualEditor.actions';

import { PatternEditorAction } from '../shared/patternEditorAction';
import { ParseAction,
         ActionTypes as TextActionTypes } from '../textualEditor/textualEditor.actions';
import { generateUUID } from '../shared/uuid';

export interface VisualEditorState {
    nodes: vis.Node[];
    edges: vis.Edge[];
}

const defaultState: VisualEditorState = {
    nodes: [],
    edges: [],
};

export function VisualEditorReducer(state: VisualEditorState = defaultState, incomingAction: PatternEditorAction): VisualEditorState {
    switch (incomingAction.type) {
        case ActionTypes.INITIALIZE: {
            const action = incomingAction as InitializeAction;

            return {
                nodes: action.nodes,
                edges: action.edges,
            };
        }
        case ActionTypes.ADD_NODE: {
            const action = incomingAction as AddNodeAction;
            const id = action.id ? action.id : generateUUID();
            const label = action.label;

            return {
                nodes: [ ...state.nodes, {id: "n" + id, x: action.x, y: action.y, label: label}],
                edges: state.edges,
            };
        }
        case ActionTypes.EDIT_NODE_LABEL: {
            const action = incomingAction as EditNodeLabelAction;
            const nodeId = action.nodeId;
            const label = action.label;

            return {
                ...state,
                nodes: state.nodes.map(node => { return node.id !== nodeId ? node : {...node, label: label }; }),
            };
        }
        case ActionTypes.EDIT_NODE_POSITION: {
            const action = incomingAction as EditNodePositionAction;
            const nodeId = action.nodeId;
            const x = action.x;
            const y = action.y;

            return {
                ...state,
                nodes: state.nodes.map(node => { return node.id !== nodeId ? node : {...node, x: x, y: y}; }),
            };
        }
        case ActionTypes.ADD_EDGE: {
            const action = incomingAction as AddEdgeAction;
            const from = action.from;
            const to = action.to;
            const id = action.id;

            return {
                ...state,
                edges: [ ...state.edges, {id: id, from: from, to: to}]
            };
        }
        case ActionTypes.EDIT_EDGE_LABEL: {
            const action = incomingAction as EditEdgeLabelAction;
            const edgeId = action.id;
            const label = action.label;

            return {
                ...state,
                edges: state.edges.map((edge) => {return edge.id !== edgeId ? edge : {...edge, label: label}; }),
            };
        }
        case ActionTypes.REMOVE_NODE: {
            const action = incomingAction as RemoveNodeAction;

            const id = action.id;

            return {
                nodes: state.nodes.filter(n => n.id !== id),
                edges: state.edges.filter(e => e.from === id || e.to === id),
            };
        }
        case ActionTypes.REMOVE_EDGE: {
            const action = incomingAction as RemoveEdgeAction;

            const id = action.id;

            return {
                ...state,
                edges: state.edges.filter(e => e.id !== id),
            };
        }
        case TextActionTypes.PARSE: {
            const action = incomingAction as ParseAction;

            return {
                ...state,
                nodes: action.nodes,
                edges: action.edges,
            };
        }
        default: {
            return state;
        }
    }
}