import { Graph, GraphNode } from './models/graph';
import { GraphBuilder } from './graphBuilder';
import { Pattern, NodeIndex, ReturnOperationItem } from './models';

export class Context {
    graph: Graph;
    contextNodeIndex: number;

    constructor() {
        var newGraph: Graph = {
            nodes: []
        };
        let context: Context = {
            contextNodeIndex: -1,
            graph: newGraph,
            encode: this.encode
        };
        return context;
    }

    static fromEncodedUrl(value: string): Context {
        let contextString = decodeURI(value);
        contextString = decodeURIComponent(contextString);
        let dto = JSON.parse(contextString) as Context;

        let result = new Context();
        result.contextNodeIndex = dto.contextNodeIndex;
        result.graph = dto.graph;
        return result;
    }

    static fromGraph(graph: Graph): Context {
        const context = new Context();

        const graphBuilder = new GraphBuilder();
        graph.nodes.forEach((graphNode, nodeIndex) => {
            graphBuilder.addNode(graphNode.name, graphNode.content);
            graphNode.relations.forEach((relation) => graphBuilder.addRelation(nodeIndex, relation.targetNodeIndex, relation.name));
        });

        context.graph = graphBuilder.getGraph();
        return context;
    }

    static getContextNode(context: Context): GraphNode {
        return context.graph.nodes[context.contextNodeIndex];
    }

    static fromPatternAndGraph(pattern: Pattern, graph: Graph): Context {
        let context = Context.fromGraph(pattern.graph);
        context.contextNodeIndex = (pattern.operations.item('RETURN')[0] as NodeIndex).nodeIndex;

        const returnOperations = pattern.operations.item('RETURN') as ReturnOperationItem[];

        returnOperations.forEach((operationItem, operationIndex) => {
            if (Pattern.IsNodeOperation(operationItem)) {
                context.graph.nodes[operationItem.nodeIndex].name = graph.nodes[operationIndex].name;
                context.graph.nodes[operationItem.nodeIndex].content = graph.nodes[operationIndex].content;
            }

            if (Pattern.IsRelationOperation(operationItem)) {
                let targetNodeIndex = pattern.operations.item('RETURN').findIndex(i => i.nodeIndex === operationItem.relationIndex[0]);
                let relationOperations = pattern.operations.item('RETURN')
                    .filter(i => Pattern.IsRelationOperation(i as ReturnOperationItem) &&
                                (i as ReturnOperationItem).relationIndex[0] === operationItem.relationIndex[0]);
                let targetRelationIndex = relationOperations.findIndex(i => (i as ReturnOperationItem).relationIndex[1] === operationItem.relationIndex[1]);

                context.graph.nodes[operationItem.relationIndex[0]].relations[operationItem.relationIndex[1]].name =
                    graph.nodes[targetNodeIndex].relations[targetRelationIndex].name;
            }
        });

        return context;
    }

    encode(): string {
        const stringified = JSON.stringify(this);
        return encodeURIComponent(stringified);
    }
}