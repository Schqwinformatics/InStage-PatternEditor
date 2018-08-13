import * as vis from 'vis';
import { Pattern, Graph } from '../../../shared/models';
import { PatternBuilder, Dictionary } from '../../../shared';
import { generateUUID } from '../uuid';
import { Context } from '../../../shared/context';

export class PatternToNetworkParser {

    public static parsePattern(pattern: Pattern): { nodes: vis.Node[], edges: vis.Edge[] } {

        return this.parse(pattern.graph);
    }

    public static parseContext(context: Context): { nodes: vis.Node[], edges: vis.Edge[] } {

        return this.parse(context.graph);
    }

    private static parse(graph: Graph): { nodes: vis.Node[], edges: vis.Edge[] } {
        let nodes: vis.Node[] = [];
        let edges: vis.Edge[] = [];

        let idToIndexDictionary: Dictionary<string, number> = new Dictionary<string, number>();

        for (let i = 0; i < graph.nodes.length; i++) {

            let currentNode = graph.nodes[i];
            let currentVisNode: vis.Node = {
                id: generateUUID(),
                label: currentNode.name
            };
            nodes.push(currentVisNode);
        }

        for (let i = 0; i < graph.nodes.length; i++) {

            let currentNode = graph.nodes[i];

            currentNode.relations.forEach((relation, index) => {
                let currentVisEdge: vis.Edge = {
                    id: generateUUID(),
                    from: nodes[i].id.toString(),
                    to: nodes[relation.targetNodeIndex].id.toString(),
                    label: relation.name
                };

                edges.push(currentVisEdge);
            });
        }

        return {
            nodes: nodes,
            edges: edges
        };
    }
}