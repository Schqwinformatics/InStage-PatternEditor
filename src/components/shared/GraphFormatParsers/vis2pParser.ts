import * as vis from 'vis';
import { Pattern, Graph } from '../../../shared/models';
import { PatternBuilder, Dictionary } from '../../../shared';

class NetworkToPatternParser {

    public static parse(nodes: vis.Node[], edges: vis.Edge[]): Pattern {
        let graph: Graph = {
            nodes: []
        };

        let idToIndexDictionary: Dictionary<string, number> = new Dictionary<string, number>();

        for (let i = 0; i < nodes.length; i++) {

            let node = nodes[i];
            idToIndexDictionary.add(node.id.toString(), i);
            graph.nodes.push({
                content: "",
                name: node.label,
                relations: []
            });
        }

        for (let i = 0; i < edges.length; i++) {

            let edge = edges[i];
            let fromIndex = idToIndexDictionary.item(edge.from.toString());
            let toIndex = idToIndexDictionary.item(edge.to.toString());

            graph.nodes[fromIndex].relations.push({
                name: edge.label,
                targetNodeIndex: toIndex
            });
        }

        const patternBuilder = PatternBuilder.fromGraph(graph);
        const pattern = patternBuilder.getPattern();

        return pattern;
    }
}