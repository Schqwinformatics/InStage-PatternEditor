import { Pattern } from '../../../shared/models';

class PatternToTextParser {

    public static parsePatternToCode(pattern: Pattern): string[] {
        let codeLines: string[] = [];
        let currentID: number = 0;

        codeLines.push(PatternToTextParser.patternBuilderInitLine());

        let graph = pattern.graph;

        graph.nodes.forEach((node, index) => {
            let nodeNameCamelCase = node.name.toLowerCase();
            codeLines.push(PatternToTextParser.addNodeLine(nodeNameCamelCase + "_" + index, node.name));
        });

        graph.nodes.forEach((node, nodeIndex) => {
            node.relations.forEach((relation, relationIndex) => {
                let variableName = node.name.toLowerCase() + "_"
                                 + relation.name + "_"
                                 + graph.nodes[relation.targetNodeIndex].name.toLowerCase();

                codeLines.push(PatternToTextParser.addRelationLine(variableName, nodeIndex, relation.targetNodeIndex, relation.name));
            });
        });

        return codeLines;
    }

    private static patternBuilderInitLine(): string {
        return "const patternBuilder = new PatternBuilder();";
    }

    private static addNodeLine(variableName: string, nodeLabel: string): string {
        return `const $(variableName) = patternBuilder.addNode("$(nodeLabel)")`;
    }

    private static addRelationLine(variableName: string, fromIndex: number, toIndex: number, edgeLabel: string): string {
        return `const $(variableName) = patternBuilder.addRelation($(fromIndex), $(toIndex), $(edgeLabel));`;
    }
}
