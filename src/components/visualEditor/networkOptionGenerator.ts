import { generateUUID } from '../shared/uuid';

export function generateOptions(
    addNode: (label: string, x: number, y: number, nodeId: string) => void,
    removeNode: (nodeId: string) => void,
    addEdge: (id: string, fromId: string, toId: string) => void,
    editEdgeEndpoints: (id: string, fromId: string, toId: string) => void,
    removeEdge: (id: string) => void
): vis.Options {
    const options = {
        autoResize: true,
        height: '900px',
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
              title: "",
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
                addEdge(generateUUID(), edgeData.from.toString(), edgeData.to.toString());
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
                editEdgeEndpoints(id.toString(), from.toString(), to.toString());
                callback(edgeData);
            }),
            deleteEdge: ((deleteData: { nodes: vis.Node[],
                                        edges: vis.Edge[]
            }                        , callback: (deleteData: { nodes: vis.Node[],
                                                   edges: vis.Edge[] }
                                    ) => void) => {
                deleteData.edges.forEach((id) => removeEdge(id.toString()));
                callback(deleteData);
            }),
            addNode: ((nodeData: vis.Node, callback: (nodeData: vis.Node) => void) => {
                addNode(nodeData.label, nodeData.x, nodeData.y, nodeData.id.toString());
                callback(nodeData);
            }),
            deleteNode: ((deleteData: { nodes: vis.Node[],
                                        edges: vis.Edge[]
                       }, callback: (deleteData: { nodes: vis.Node[],
                                                   edges: vis.Edge[] }
                                    ) => void) => {
                deleteData.nodes.forEach((id) => removeNode(id.toString()));
                callback(deleteData);
            }),
        },
        physics: {
            enabled: false,
        },
    };

    return options;
}