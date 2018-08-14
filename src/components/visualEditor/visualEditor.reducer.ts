import { ActionTypes,
    AddNodeAction,
    AddEdgeAction,
    RemoveNodeAction,
    RemoveEdgeAction,
    InitializeAction,
    EditNodeLabelAction,
    EditEdgeLabelAction, 
    EditNodePositionAction,
    AddOperationToSelectionAction} from './visualEditor.actions';

import { PatternEditorAction } from '../shared/patternEditorAction';
import { ParseAction,
         ActionTypes as TextActionTypes } from '../textualEditor/textualEditor.actions';
import { generateUUID } from '../shared/uuid';
import { OperationTypes } from './visualEditor';

export interface visualEditorNode {
    visNode: vis.Node,
    operations: OperationTypes[]
}

export interface visualEditorEdge {
    visEdge: vis.Edge,
    operations: OperationTypes[]
}

export interface VisualEditorState {
    nodes: visualEditorNode[]
    edges: visualEditorEdge[];
}

const defaultState: VisualEditorState = {
    nodes: [],
    edges: [],
};

const Color = require('color');

export function VisualEditorReducer(state: VisualEditorState = defaultState, incomingAction: PatternEditorAction): VisualEditorState {
    switch (incomingAction.type) {
        case ActionTypes.INITIALIZE: {
            const action = incomingAction as InitializeAction;

            return {
                ...state,
                nodes: action.nodes,
                edges: action.edges,
            };
        }
        case ActionTypes.ADD_NODE: {
            const action = incomingAction as AddNodeAction;
            const id = action.id ? action.id : generateUUID();
            const label = action.label;

            return {
                nodes: [ ...state.nodes, {visNode: {id: generateUUID(), x: action.x, y: action.y, label: label}, operations: []}],
                edges: state.edges,
            };
        }
        case ActionTypes.EDIT_NODE_LABEL: {
            const action = incomingAction as EditNodeLabelAction;
            const nodeId = action.nodeId;
            const label = action.label;

            return {
                ...state,
                nodes: state.nodes.map(node => { return node.visNode.id !== nodeId ? node : {...node, visNode: {...node.visNode, label: label }}; }),
            };
        }
        case ActionTypes.EDIT_NODE_POSITION: {
            const action = incomingAction as EditNodePositionAction;
            const nodeId = action.nodeId;
            const x = action.x;
            const y = action.y;

            return {
                ...state,
                nodes: state.nodes.map(node => { return node.visNode.id !== nodeId ? node : {...node, visNode: {x: x, y: y}}; }),
            };
        }
        case ActionTypes.ADD_EDGE: {
            const action = incomingAction as AddEdgeAction;
            const from = action.from;
            const to = action.to;
            const id = action.id;

            return {
                ...state,
                edges: [ ...state.edges, { visEdge: {id: id, from: from, to: to}, operations: []}]
            };
        }
        case ActionTypes.EDIT_EDGE_LABEL: {
            const action = incomingAction as EditEdgeLabelAction;
            const edgeId = action.id;
            const label = action.label;

            return {
                ...state,
                edges: state.edges.map((edge) => {return edge.visEdge.id !== edgeId ? edge : {...edge, label: label}; }),
            };
        }
        case ActionTypes.REMOVE_NODE: {
            const action = incomingAction as RemoveNodeAction;

            const id = action.id;

            return {
                nodes: state.nodes.filter(n => n.visNode.id !== id),
                edges: state.edges.filter(e => e.visEdge.from !== id && e.visEdge.to !== id),
            };
        }
        case ActionTypes.REMOVE_EDGE: {
            const action = incomingAction as RemoveEdgeAction;

            const id = action.id;

            return {
                ...state,
                edges: state.edges.filter(e => e.visEdge.id !== id),
            };
        }
        case ActionTypes.ADD_OPERATION_TO_SELECTION: {
            const action = incomingAction as AddOperationToSelectionAction;

            const operation = action.operationType;

            return {
                ...state,
                nodes: state.nodes.map((node: visualEditorNode) => {
                    return action.nodeIds.indexOf(node.visNode.id.toString()) === -1 ? node : addOperationToNode(node, operation);
                }),
                edges: state.edges.map((edge: visualEditorEdge) => {
                    return action.edgeIds.indexOf(edge.visEdge.id.toString()) === -1 ? edge : addOperationToEdge(edge, operation);
                })
            }
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

function addOperationStyleToNode(node: visualEditorNode, operationType: OperationTypes): visualEditorNode {
    
    var color: any;
    
    switch (operationType) {
        case OperationTypes.MATCH: {
            color = Color('red');
            break;
        }
        break;
        case OperationTypes.OPTIONAL_MATCH: {
            color = Color('blue');
            break;
        }
        case OperationTypes.RETURN: {
            color = Color('yellow');
            break;
        }
        default: {
            color = Color('black');
        }
    }

    if (node.visNode.color) {
        return {
            ...node,
            visNode: {
            color: {
                    background: color.mix(Color(node.visNode.color.background)).string(),
                    border: color.mix(Color(node.visNode.color.border)).string(),
                    highlight: color.mix(Color(node.visNode.color.border)).string(),
                    hover: color.mix(Color(node.visNode.color.border)).string()
                }
            }
        }
    } else {
        return {
            ...node,
            visNode: {
                color: {
                    background: color.string()
                }
            }
        }
    }
}

function addColorToNode(node: vis.Node, color: any): vis.Node {
    if (node.color) {
        return {
            ...node,
            color: {
                background: color.mix(Color(node.color.background)).string(),
                border: color.mix(Color(node.color.border)).string(),
                highlight: color.mix(Color(node.color.border)).string(),
                hover: color.mix(Color(node.color.border)).string()
            }
        }
    } else {
        return {
            ...node,
            color: {
                background: color.string()
            }
        }
    }
}

function addOperationToNode(node: visualEditorNode, operation: OperationTypes): visualEditorNode {
    if (node.operations.indexOf(operation) === -1) {
        return {
            ...node,
            operations: [...node.operations, operation]
        }
    } else {
        return {
            ...node
        }
    } 
}

function addOperationToEdge(edge: visualEditorEdge, operation: OperationTypes): visualEditorEdge {
    if (edge.operations.indexOf(operation) === -1) {
        return {
            ...edge,
            operations: [...edge.operations, operation]
        }
    } else {
        return {
            ...edge
        }
    }
}
