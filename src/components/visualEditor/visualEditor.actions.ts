import { PatternEditorAction } from '../shared/patternEditorAction';
import { Context } from '../../shared/context';
import { generateUUID } from '../shared/uuid';
import { PatternToNetworkParser } from '../shared/GraphFormatParsers/p2visParser';

export enum ActionTypes {
    INITIALIZE = 'PATTERNEDITOR.INITIALIZE',

    ADD_NODE = 'PATTERNEDITOR.ADD.NODE',
    EDIT_NODE_LABEL = 'PATTERNEDITOR.EDIT.NODE.LABEL',
    EDIT_NODE_POSITION = 'PATTERNEDITOR.EDIT.NODE.POSITION',
    REMOVE_NODE = 'PATTERNEDITOR.REMOVE.NODE',

    ADD_EDGE = 'PATTERNEDITOR.ADD.EDGE',
    EDIT_EDGE_LABEL = 'PATTERNEDITOR.EDIT.EDGE.LABEL',
    EDIT_EDGE_ENDPOINTS = 'PATTERNEDITOR.EDIT.EDGE.ENDPOINTS',
    REMOVE_EDGE = 'PATTERNEDITOR.REMOVE.EDGE'
}

export interface InitializeAction extends PatternEditorAction {
    nodes: vis.Node[];
    edges: vis.Edge[];
}

export interface AddNodeAction extends PatternEditorAction {
    label: string;
    x: number;
    y: number;
    id?: string;
}

export interface EditNodeLabelAction extends PatternEditorAction {
    label: string;
    nodeId: string;
}

export interface EditNodePositionAction extends PatternEditorAction {
    nodeId: string;
    x: number;
    y: number;
}

export interface AddEdgeAction extends PatternEditorAction {
    id: string;
    from: string;
    to: string;
}

export interface EditEdgeLabelAction extends PatternEditorAction {
    id: string;
    label: string;
}

export interface EditEdgeEndpointsAction extends PatternEditorAction {
    id: string;
    from: string;
    to: string;
}

export interface RemoveNodeAction extends PatternEditorAction {
    id: string;
}

export interface RemoveEdgeAction extends PatternEditorAction {
    id: string;
}

export function initialize(context: Context): InitializeAction {

    let networkData = PatternToNetworkParser.parseContext(context);

    return {
            type: ActionTypes.INITIALIZE,
            nodes: networkData.nodes,
            edges: networkData.edges
    };
}

export function addNode(label: string, x: number, y: number, id?: string): AddNodeAction {
        return {
            type: ActionTypes.ADD_NODE,
            label: label,
            x: x,
            y: y,
            id: id ? id : undefined
        };
}

export function editNodeLabel(nodeId: string, label: string): EditNodeLabelAction {
    return {
        type: ActionTypes.EDIT_NODE_LABEL,
        label: label,
        nodeId: nodeId
    };
}

export function changeNodePosition(id: string, x: number, y: number): EditNodePositionAction {
    return {
        type: ActionTypes.EDIT_NODE_POSITION,
        nodeId: id,
        x: x,
        y: y
    };
}

export function removeNode(id: string): RemoveNodeAction {
    return {
        type: ActionTypes.REMOVE_NODE,
        id: id,
    };
}

export function addEdge(id: string, from: string, to: string): AddEdgeAction {
    return {
        type: ActionTypes.ADD_EDGE,
        id: id,
        from: from,
        to: to
    };
}

export function editEdgeLabel(edgeId: string, label: string): EditEdgeLabelAction {
    return {
        type: ActionTypes.EDIT_EDGE_LABEL,
        id: edgeId,
        label: label
    };
}

export function editEdgeEndpoints(edgeId: string, from: string, to: string): EditEdgeEndpointsAction {
    return {
        type: ActionTypes.EDIT_EDGE_ENDPOINTS,
        id: edgeId,
        from: from,
        to: to
    };
}

export function removeEdge(edgeId: string): RemoveEdgeAction {
    return {
        type: ActionTypes.REMOVE_EDGE,
        id: edgeId
    };
}
