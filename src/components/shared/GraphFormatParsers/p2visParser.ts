import * as vis from 'vis';
import { Pattern, Graph } from '../../../shared/models';
import { PatternBuilder, Dictionary } from '../../../shared';
import { generateUUID } from '../uuid';
import { Context } from '../../../shared/context';
import { visualEditorNode, visualEditorEdge } from '../../visualEditor/visualEditor.reducer';

export class PatternToNetworkParser {

    public static parsePattern(pattern: Pattern): { nodes: visualEditorNode[], edges: visualEditorEdge[] } {

        return this.parse(pattern.graph);
    }

    public static parseContext(context: Context): { nodes: visualEditorNode[], edges: visualEditorEdge[] } {

        return this.parse(context.graph);
    }

    private static parse(graph: Graph): { nodes: visualEditorNode[], edges: visualEditorEdge[] } {
        let nodes: visualEditorNode[] = [];
        let edges: visualEditorEdge[] = [];

        let idToIndexDictionary: Dictionary<string, number> = new Dictionary<string, number>();

        for (let i = 0; i < graph.nodes.length; i++) {

            let currentNode = graph.nodes[i];
            let currentVisualEditorNode: visualEditorNode = {
                visNode: {
                    id: generateUUID(),
                    label: currentNode.name
                },
                operations: []
            };
            nodes.push(currentVisualEditorNode);
        }

        for (let i = 0; i < graph.nodes.length; i++) {

            let currentNode = graph.nodes[i];

            currentNode.relations.forEach((relation, index) => {
                let currentVisEdge: visualEditorEdge = {
                        visEdge: {
                        id: generateUUID(),
                        from: nodes[i].visNode.id.toString(),
                        to: nodes[relation.targetNodeIndex].visNode.id.toString(),
                        label: relation.name
                    },
                    operations: []
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