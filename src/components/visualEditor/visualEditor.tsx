import * as React from 'react';
import * as vis from 'vis';
import { Pattern } from '../../shared/models';
import { Button, Typography, Paper, MenuList, MenuItem } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from '../shared';
import { Dispatch } from 'redux';
import { PatternEditorAction } from '../shared/patternEditorAction';
import * as actions from './visualEditor.actions';
import { Context } from '../../shared/context';
import '../../../node_modules/vis/dist/vis.css';
import '../../../node_modules/vis/dist/vis.js';
import { generateUUID } from '../shared/uuid';
import { generateOptions } from './networkOptionGenerator';

export interface VisualEditorProps {
    nodes?: vis.Node[];
    edges?: vis.Edge[];
    context?: Context;
    isFocussed?: boolean;

    initializeFromContext?: (context: Context) => Promise<{ nodes: vis.Node[], edges: vis.Edge[] }>;

    addNode?: (label: string, x: number, y: number, id?: string) => Promise<void>;
    editNodeLabel?: (nodeId: string, label: string) => Promise<void>;
    changeNodePosition?: (nodeId: string, x: number, y: number) => Promise<void>;
    removeNode?: (nodeId: string) => Promise<void>;

    addEdge?: (id: string, from: string, to: string) => Promise<void>;
    editEdgeLabel?: (edgeId: string, label: string) => Promise<void>;
    editEdgeEndpoints?: (id: string, from: string, to: string) => Promise<void>;
    removeEdge?: (edgeId: string) => Promise<void>;

    addOperationToSelection?: (operationType: OperationTypes, nodeIds: string[], edgeIds: string[]) => Promise<void>;
}

enum ClickEventTargetTypes {
    EDGE = 'Edge',
    NODE = 'Node',
    NONE = 'None',
    MIXED = 'Mixed'
}

export enum OperationTypes {
    MATCH = 'Match',
    OPTIONAL_MATCH = 'Optional_Match',
    RETURN = 'Return',
}

interface VisualEditorState {

}

export class VisualEditor extends React.Component<VisualEditorProps, VisualEditorState> {

    graphNetwork: vis.Network;
    networkOptions = {
        autoResize: true,
        height: "100%",
        width: "100%",
        };

    constructor(props: VisualEditorProps) {
        super(props);
    }

    public async componentDidMount(): Promise<void> {

        if (this.props.initializeFromContext !== undefined && this.props.context !== undefined) {
            this.props.initializeFromContext(this.props.context);
        }

        var data: {
            nodes: vis.NodeOptions[],
            edges: vis.EdgeOptions[]
        } = {
            nodes: this.props.nodes ? this.props.nodes : [],
            edges: this.props.edges ? this.props.edges : [],
        };

        var container = document.getElementById('GraphVisualization');

        if (container === null) {
            return;
        }
        this.graphNetwork = new vis.Network(container, data, this.networkOptions);

        const options = generateOptions(
            (label: string, x: number, y: number, id: string) => this.addNode(label, x, y, id), 
            (id: string) => this.removeNode(id),
            (edgeId: string, fromId: string, toId: string) => this.addEdge(edgeId, fromId, toId), 
            (edgeId: string, fromId: string, toId: string) => this.editEdgeEndpoints(edgeId, fromId, toId), 
            (edgeId: string) => this.removeEdge(edgeId));

        this.graphNetwork.setOptions(options);
        this.graphNetwork.on('doubleClick', (e) => {
            switch (this.checkTargetOfClickEvent(e)) {

                case ClickEventTargetTypes.EDGE:
                    let edgeName = prompt("Bitte geben Sie einen Namen für die Kante ein: ", "IS_A");
                    let edgeId = e.edges[0];
                    this.editEdgeLabel(edgeId, edgeName);
                    break;

                case ClickEventTargetTypes.NODE:
                    let nodeName = prompt("Bitte geben Sie einen Namen für den Knoten ein: ", "NODE");
                    let nodeId = e.nodes[0];
                    this.editNodeLabel(nodeId, nodeName);
                    break;

                case ClickEventTargetTypes.MIXED:
                    let nodeNameMixed = prompt("Bitte geben Sie einen namen für den Knoten ein: ", "MIXED");
                    let nodeIdMixed = e.nodes[0];
                    this.editNodeLabel(nodeIdMixed, nodeNameMixed);
                    break;

                case ClickEventTargetTypes.NONE:
                    this.addNode("new", e.pointer.canvas.x, e.pointer.canvas.y);
                    break;
                default:
                    let debug3 = 45;
                    break;
            }
        });
        this.graphNetwork.on('dragEnd', (e) => {
            switch (this.checkTargetOfClickEvent(e)) {

                case ClickEventTargetTypes.NODE:
                    let nodeId: vis.IdType = e.nodes[0];
                    let position: vis.Position = this.graphNetwork.getPositions(nodeId);
                    this.props.changeNodePosition(nodeId.toString(), position[nodeId].x, position[nodeId].y);
                    break;
                
                case ClickEventTargetTypes.MIXED:
                    let nodeIdMixed: vis.IdType = e.nodes[0];
                    let positionMixed: vis.Position = this.graphNetwork.getPositions(nodeIdMixed);
                    this.props.changeNodePosition(nodeIdMixed.toString(), positionMixed[nodeIdMixed].x, positionMixed[nodeIdMixed].y);
                    break;

                default:
                    break;
            }
        });
    }

    componentDidUpdate(prevProps: VisualEditorProps, prevState: {}): void {

        var context = this.props.context;
        var nodes = this.props.nodes;
        var edges = this.props.edges;

        var data = {
            nodes: nodes,
            edges: edges
        };

        var viewPosition = this.graphNetwork.getViewPosition();
        var zoomLevel = this.graphNetwork.getScale();

        if (this.graphNetwork) {
            this.graphNetwork.setData(data);
            this.graphNetwork.moveTo({
                position: {
                    x: viewPosition.x,
                    y: viewPosition.y,
                },
                scale: zoomLevel
            });
        }
    }

    public render(): JSX.Element {
        return (
            <>
                <Typography variant="display1">Graphischer PatternEditor</Typography>
                <Paper style={{height: '100%'}}>
                    <div    id={"GraphVisualization"} 
                            onKeyPress={(e: React.KeyboardEvent<HTMLDivElement>) => this.handleKeyEvent(e)} 
                            style={{height: "100%", width: "100%"}} />

                    <Button variant="fab" 
                        color="primary" 
                        onClick={() => this.addSelectionToOperation(OperationTypes.MATCH)}
                        style={{position: "absolute", bottom: 180, left: 170, width: 70}}
                    >
                        MATCH
                    </Button>
                    <Button variant="fab" 
                            color="default" 
                            onClick={() => this.addSelectionToOperation(OperationTypes.OPTIONAL_MATCH)}
                            style={{position: "absolute", bottom: 180, left: 250, width: 70}}
                    >
                        O_MATCH
                    </Button>
                    <Button variant="fab" 
                            color="secondary" 
                            onClick={() => this.addSelectionToOperation(OperationTypes.RETURN)}
                            style={{position: "absolute", bottom: 180, left: 330, width: 70}}
                    >
                        RETURN
                    </Button>
                    <Button variant="fab" 
                            color="default" 
                            onClick={() => this.convertToDOTLanguage()}
                            style={{position: "absolute", bottom: 180, left: 860, width: 70}}
                    >
                        DOT
                    </Button>
                    <Button variant="fab" 
                            color="default" 
                            onClick={() => this.convertToCypher()}
                            style={{position: "absolute", bottom: 180, left: 950, width: 70}}
                    >
                        CYPHER
                    </Button>
                </Paper>
            </>
        );
    }

    private handleKeyEvent(e: React.KeyboardEvent<HTMLDivElement>): void {
        this.graphNetwork.addEdgeMode();
    }

    private addSelectionToOperation(operationType: OperationTypes): void {

        let selection = this.graphNetwork.getSelection();
        let nodeIds = selection.nodes.map((nodeId: vis.IdType) => {
            return nodeId.toString();
        });
        let edgeIds = selection.edges.map((edgeId: vis.IdType) => {
            return edgeId.toString();
        });
        
        this.props.addOperationToSelection(operationType, nodeIds, edgeIds);
    }

    private convertToDOTLanguage(): void {
        const nodes = this.props.nodes;
        const edges = this.props.edges;


    }

    private convertToCypher(): void {
        alert("not implemented");
    }

    private editNodeLabel(nodeId: string, label: string): void {
        if (this.props.editNodeLabel) {
            this.props.editNodeLabel(nodeId, label);
        }
    }

    private editEdgeLabel(edgeId: string, label: string): void {
        if (this.props.editEdgeLabel) {
            this.props.editEdgeLabel(edgeId, label);
        }
    }

    private editEdgeEndpoints(edgeId: string, from: string, to: string): void {
        if (this.props.editEdgeEndpoints) {
            this.props.editEdgeEndpoints(edgeId, from, to);
        }
    }

    private addNode(label: string, x: number, y: number, id?: string): void {
        if (this.props.addNode) {
            if (id) {
                this.props.addNode(label, x, y, id);
            } else {
                this.props.addNode(label, x, y);
            }
        }
    }

    private removeNode(id: string): void {
        if (this.props.removeNode) {
            this.props.removeNode(id);
        }
    }

    private addEdge(id: string, from: string, to: string): void {
        if (this.props.addEdge) {
            this.props.addEdge(id, from, to);
        }
    }

    private removeEdge(id: string): void {
        if (this.props.removeEdge) {
            this.props.removeEdge(id);
        }
    }

    private checkTargetOfClickEvent(e: any): ClickEventTargetTypes {
        if (e.nodes.length === 0 && e.edges.length === 0) {
            return ClickEventTargetTypes.NONE;
        } else {
            if (e.nodes.length === 0) {
                return ClickEventTargetTypes.EDGE;
            } else {
                if (e.edges.length === 0) {
                    return ClickEventTargetTypes.NODE;
                }
            }
        }

        return ClickEventTargetTypes.MIXED;
    }
}

function mapStateToProps(state: RootState): {} | VisualEditorProps {
    return {
        nodes: state.VisualEditorReducer.nodes,
        edges: state.VisualEditorReducer.edges
    };
}

function mapDispatchToProps(dispatch: Dispatch<PatternEditorAction>): {} | VisualEditorProps {
    return {
        addNode: (label: string, x: number, y: number, id?: string) => {
            if (id) {
                dispatch(actions.addNode(label, x, y, id));
            } else {
                dispatch(actions.addNode(label, x, y));
            }
        },
        addEdge: (id: string, from: string, to: string) => {
            dispatch(actions.addEdge(id, from, to));
        },
        editNodeLabel: (nodeId: string, label: string) => {
            dispatch(actions.editNodeLabel(nodeId, label));
        },
        changeNodePosition: (nodeId: string, x: number, y: number) => {
            dispatch(actions.changeNodePosition(nodeId, x, y));
        },
        removeNode: (nodeId: string) => {
            dispatch(actions.removeNode(nodeId));
        },
        editEdgeLabel: (edgeId: string, label: string) => {
            dispatch(actions.editEdgeLabel(edgeId, label));
        },
        editEdgeEndpoints: (edgeId: string, from: string, to: string) => {
            dispatch(actions.editEdgeEndpoints(edgeId, from, to));
        },
        removeEdge: (edgeId: string) => {
            dispatch(actions.removeEdge(edgeId));
        },
        addOperationToSelection: (operationType: OperationTypes, nodeIds: string[], edgeIds: string[]) => {
            dispatch(actions.addOperationToSelection(operationType, nodeIds, edgeIds));
        },
        initializeFromContext: (context: Context) => {
            dispatch(actions.initialize(context));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(VisualEditor);