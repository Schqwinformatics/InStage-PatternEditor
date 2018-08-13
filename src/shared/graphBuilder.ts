import { Graph, GraphNode, GraphRelation } from "./models/graph";
import { Models } from '.';

export class GraphBuilder {
    private _graph: Graph;

    constructor() {
        this._graph = {
            nodes: []
        };
    }

    static fromGraph(graph: Graph): GraphBuilder {
        const graphBuilder = new GraphBuilder();

        graph.nodes.forEach((graphNode, nodeIndex) => {
            graphBuilder.addNode(graphNode.name, graphNode.content);
            graphNode.relations.forEach((relation) => graphBuilder.addRelation(nodeIndex, relation.targetNodeIndex, relation.name));
        });

        return graphBuilder;
    }

    addNode(name?: string, content?: string): Models.NodeIndex {
        let node: GraphNode = {
            name: name,
            content: content,
            relations: new Array<GraphRelation>()
        };

        let arrayLength = this._graph.nodes.push(node);
        let nodeIndex: Models.NodeIndex = {
            nodeIndex: arrayLength - 1
        };
        return nodeIndex;
    }

    addRelation(nodeIndex: number, targetNodeIndex: number, name?: string): Models.RelationIndex {
        let relation: GraphRelation = {
            name: name,
            targetNodeIndex: targetNodeIndex
        };

        let arrayLength = this._graph.nodes[nodeIndex].relations.push(relation);
        let relationIndex: Models.RelationIndex = {
            relationIndex: [nodeIndex, arrayLength - 1]
        };
        return relationIndex;
    }

    getGraph(): Graph {
        return {
            nodes: this._graph.nodes.map((node) => {
                return {
                    name: node.name,
                    content: node.content,
                    relations: node.relations.map((relation) => {
                        return {
                            name: relation.name,
                            targetNodeIndex: relation.targetNodeIndex
                        };
                    })
                };
            })
        };
    }
}