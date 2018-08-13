import { GraphBuilder } from './graphBuilder';

import { Graph } from './models/graph';
import {
    Pattern, Operations, OperationItem, MatchOperationItem, CreateOperationItem,
    ReturnOperationItem, SetOperationItem, OrderByOperationItem, DeleteOperationItem } from './models/pattern';
import { Dictionary } from './dictionary';

export const Anything: string = null;

export class PatternBuilder extends GraphBuilder {
    private _operations: Dictionary<Operations, OperationItem[]>;
    private _skip: number;
    private _limit: number;

    constructor() {
        super();
        this._operations = new Dictionary<Operations, OperationItem[]>();
    }

    static fromGraph(graph: Graph): PatternBuilder {
        const patternBuilder = new PatternBuilder();

        graph.nodes.forEach((graphNode, nodeIndex) => {
            patternBuilder.addNode(graphNode.name, graphNode.content);
            graphNode.relations.forEach((relation) => patternBuilder.addRelation(nodeIndex, relation.targetNodeIndex, relation.name));
        });

        return patternBuilder;
    }

    addMatchOperations(indices: MatchOperationItem[]): void {
        for (let item of indices) {
            this.addMatchOperation(item);
        }
    }

    addMatchOperation(item: MatchOperationItem): void {
        this.addOperation("MATCH", item);
    }

    addOptionalMatchOperations(indices: MatchOperationItem[]): void {
        for (let item of indices) {
            this.addMatchOperation(item);
        }
    }

    addOptionalMatchOperation(item: MatchOperationItem): void {
        item.isOptional = true;
        this.addOperation("MATCH", item);
    }

    addAllToMatch(): void {
        this.getGraph().nodes.forEach((node, nodeIndex) => {
            this.addMatchOperation({nodeIndex: nodeIndex});
            node.relations.forEach((relation, relationIndex) => {
                this.addMatchOperation({ relationIndex: [nodeIndex, relationIndex]});
            });
        });
    }

    addReturnOperations(indices: ReturnOperationItem[]): void {
        for (let item of indices) {
            this.addReturnOperation(item);
        }
    }

    addReturnOperation(item: ReturnOperationItem): void {
        this.addOperation("RETURN", item);
    }

    addCreateOperations(indices: CreateOperationItem[]): void {
        for (let item of indices) {
            this.addCreateOperation(item);
        }
    }

    addCreateOperation(item: CreateOperationItem): void {
        this.addOperation("CREATE", item);
    }

    addDeleteOperations(indices: DeleteOperationItem[]): void {
        for (let item of indices) {
            this.addDeleteOperation(item);
        }
    }

    addDeleteOperation(item: DeleteOperationItem): void {
        this.addOperation("DELETE", item);
    }

    addSetOperations(indices: SetOperationItem[]): void {
        for (let item of indices) {
            this.addSetOperation(item);
        }
    }

    addSetOperation(item: SetOperationItem): void {
        this.addOperation("SET", item);
    }

    addOrderByOperations(indices: OrderByOperationItem[]): void {
        for (let item of indices) {
            this.addSetOperation(item);
        }
    }

    addOrderByOperation(item: OrderByOperationItem): void {
        this.addOperation("ORDER_BY", item);
    }

    setSkip(skip: number): void {
        this._skip = skip;
    }

    setLimit(limit: number): void {
        this._limit = limit;
    }

    getPattern(): Pattern {
        return new Pattern(super.getGraph(), this.getOperations(), this._skip, this._limit);
    }

    private getOperations(): Dictionary<Operations, OperationItem[]> {
        const result = new Dictionary<Operations, OperationItem[]>();

        this._operations.keys.forEach(key => {
            this._operations.item(key).forEach(op => {
                const operationItem = JSON.parse(JSON.stringify(op));
                if (result.containsKey(key)) {
                    result.item(key).push(operationItem);
                } else {
                    result.add(key, []);
                    result.item(key).push(operationItem);
                }
            });
        });

        return result;
    }

    private addOperation(type: Operations, item: OperationItem): void {
        if (this._operations.containsKey(type)) {
            this._operations.item(type).push(item);
        } else {
            this._operations.add(type, new Array<OperationItem>());
            this._operations.item(type).push(item);
        }
    }
}