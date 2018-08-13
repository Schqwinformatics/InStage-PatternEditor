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

export interface VisualEditorProps {
    nodes?: vis.Node[];
    edges?: vis.Edge[];
    context?: Context;

    initializeFromContext?: (context: Context) => Promise<{ nodes: vis.Node[], edges: vis.Edge[] }>;
    addNode?: (label: string, x: number, y: number, id?: string) => Promise<void>;
    editNodeLabel?: (nodeId: string, label: string) => Promise<void>;
    changeNodePosition?: (nodeId: string, x: number, y: number) => Promise<void>;
    removeNode?: (nodeId: string) => Promise<void>;
    addEdge?: (id: string, from: string, to: string) => Promise<void>;
    editEdgeLabel?: (edgeId: string, label: string) => Promise<void>;
    editEdgeEndpoints?: (id: string, from: string, to: string) => Promise<void>;
    removeEdge?: (edgeId: string) => Promise<void>;
}

enum ClickEventTargetTypes {
    EDGE = 'Edge',
    NODE = 'Node',
    NONE = 'None',
    MIXED = 'Mixed'
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

        const options = {
            autoResize: true,
            height: '1000px',
            width: '100%',
            locale: 'de',
            clickToUse: false,

            edges: {
                arrows: {
                    to:     {enabled: true, scaleFactor: 1, type: 'arrow'},
                    middle: {enabled: false, scaleFactor: 1, type: 'arrow'},
                    from:   {enabled: false, scaleFactor: 1, type: 'arrow'}
                  },
                  arrowStrikethrough: true,
                  chosen: true,
                  color: {
                    color: '#848484',
                    highlight: '#848484',
                    hover: '#848484',
                    inherit: 'from',
                    opacity: 1.0
                  },
                  dashes: true,
                  hidden: false,
                  hoverWidth: 1.5,
                  label: 'HALLOOOOO :-)',
                  labelHighlightBold: true,
                  physics: true,
                  scaling: {
                    min: 1,
                    max: 15,
                    label: {
                      enabled: true,
                      min: 14,
                      max: 30,
                      maxVisible: 30,
                      drawThreshold: 5
                    },
                    customScalingFunction: (min: number, max: number, total: number, value: number) => {
                      if (max === min) {
                        return 0.5;
                      } else {
                        var scale = 1 / (max - min);
                        return Math.max(0, (value - min) * scale);
                      }
                    }
                  },
                  selectionWidth: 1,
                  selfReferenceSize: 20,
                  shadow: {
                    enabled: false,
                    color: 'rgba(0,0,0,0.5)',
                    size: 10,
                    x: 5,
                    y: 5
                  },
                  smooth: {
                    enabled: true,
                    type: "dynamic",
                    roundness: 0.5
                  },
                  title: "HALLO",
                  width: 1,
                  widthConstraint: false
            },
            nodes: {

            },
            groups: {

            },
            layout: {

            },
            interaction: {
                hover: true,
                multiselect: true,
                navigationButtons: true,
                selectConnectedEdges: true,
            },
            manipulation: {
                enabled: true,
                addEdge: ((edgeData: vis.Edge, callback: (edgeData: vis.Edge) => void) => {
                    this.addEdge(generateUUID(), edgeData.from.toString(), edgeData.to.toString());
                    edgeData.arrows = {
                        to:     {enabled: true, scaleFactor: 1, type: 'arrow'},
                        middle: {enabled: true, scaleFactor: 1, type: 'arrow'},
                        from:   {enabled: true, scaleFactor: 1, type: 'circle'}
                    };
                    callback(edgeData);
                }),
                editEdge: ((edgeData: vis.Edge, callback: (edgeData: vis.Edge) => void) => {
                    let from = edgeData.from;
                    let to = edgeData.to;
                    let id = edgeData.id;
                    this.editEdgeEndpoints(id.toString(), from.toString(), to.toString());
                    callback(edgeData);
                }),
                deleteEdge: ((deleteData: { nodes: vis.Node[],
                                            edges: vis.Edge[]
   }                        , callback: (deleteData: { nodes: vis.Node[],
                                                       edges: vis.Edge[] }
                                        ) => void) => {
                    deleteData.edges.forEach((id) => this.removeEdge(id.toString()));
                    callback(deleteData);
                }),
                addNode: ((nodeData: vis.Node, callback: (nodeData: vis.Node) => void) => {
                    this.addNode(nodeData.label, nodeData.x, nodeData.y, nodeData.id.toString());
                    callback(nodeData);
                }),
                deleteNode: ((deleteData: { nodes: vis.Node[],
                                            edges: vis.Edge[]
                           }, callback: (deleteData: { nodes: vis.Node[],
                                                       edges: vis.Edge[] }
                                        ) => void) => {
                    deleteData.nodes.forEach((id) => this.removeNode(id.toString()));
                    callback(deleteData);
                }),
            },
            physics: {
                enabled: false,
            },
        };

        this.graphNetwork.setOptions(options);
        this.graphNetwork.on('doubleClick', (e) => {
            switch (this.checkTargetOfClickEvent(e)) {

                case ClickEventTargetTypes.EDGE:
                    let edgeName = prompt("Bitte geben Sie einen Namen für die Kante ein: ", "IS_A");
                    let edgeId = e.edges[0];
                    this.editEdgeLabel(edgeId, edgeName);
                    break;

                case ClickEventTargetTypes.NODE:
                    let nodeName = prompt("Bitte geben Sie einen Namen für den Knoten ein: ", "Arsch");
                    let nodeId = e.nodes[0];
                    this.editNodeLabel(nodeId, nodeName);
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
                    let nodeId = e.nodes[0];
                    this.props.changeNodePosition(nodeId, e.pointer.canvas.x, e.pointer.canvas.y);
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

        if (this.graphNetwork) {
            this.graphNetwork.setData(data);
            // this.graphNetwork.redraw();
        }
    }

    public render(): JSX.Element {
        return (
            <>
                <Typography variant="display1">Graphischer PatternEditor</Typography>
                <Paper style={{height: '85%'}}>
                    <div id={"GraphVisualization"} style={{height: "100%", width: "100%"}} />
                </Paper>
            </>
        );
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
        initializeFromContext: (context: Context) => {
            dispatch(actions.initialize(context));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(VisualEditor);