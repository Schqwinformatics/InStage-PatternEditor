import { Graph } from './graph';
import { DictionaryDto, Dictionary } from '../dictionary';

export type Operations = 'MATCH' | 'RETURN' | 'CREATE' | 'ORDER_BY' | 'SET' | 'DELETE';

export interface PatternDto {
    operations: DictionaryDto<Operations, OperationItem[]>;
    graph: Graph;
    skip: number;
    limit: number;
}

export type OperationItem = (MatchOperationItem | ReturnOperationItem | CreateOperationItem | DeleteOperationItem | SetOperationItem | OrderByOperationItem);

export type PathOperationItem = (MatchOperationItem | CreateOperationItem | DeleteOperationItem);

export type OrderDirection = ('ASC' | 'DESC');

export interface RelationIndex {
    relationIndex?: [number, number];
}

export interface NodeIndex {
    nodeIndex?: number;
}

export interface MatchOperationItem extends NodeIndex, RelationIndex {
    isOptional?: boolean;
}

export interface ReturnOperationItem extends NodeIndex, RelationIndex {
}

export interface CreateOperationItem extends NodeIndex, RelationIndex {
}

export interface DeleteOperationItem extends NodeIndex, RelationIndex {
}

export interface SetOperationItem {
    nodeIndex: number;
    newName?: string;
    newContent?: string;
}

export interface OrderByOperationItem {
    nodeIndex: number;
    orderDirection?: OrderDirection;
}

export class Pattern {
    private _graph: Graph;
    private _skip: number;
    private _limit: number;

    constructor(graph: Graph, public operations: Dictionary<Operations, OperationItem[]>, skip?: number, limit?: number) {
        this._graph = graph;
        this._skip = skip;
        this._limit = limit;
    }

    public static fromDto(pattern: PatternDto): Pattern {
        let result = new Pattern(pattern.graph, Dictionary.fromArrays(pattern.operations.keys, pattern.operations.values), pattern.skip, pattern.limit);
        return result;
    }

    public static IsNodeOperation(operationItem: NodeIndex): boolean {
        if (isNaN(operationItem.nodeIndex)) {
            return false;
        }
        return true;
    }

    public static IsRelationOperation(operationItem: RelationIndex): boolean {
        if (operationItem.relationIndex === undefined ) {
            return false;
        }
        return true;
    }

    get graph(): Graph {
        return this._graph;
    }

    get skip(): number {
        return this._skip;
    }

    set skip(value: number) {
        this._skip = value;
    }

    get limit(): number {
        return this._limit;
    }

    set limit(value: number) {
        this._limit = value;
    }

    toJSON(): PatternDto {
        return {
            operations: this.operations,
            graph: this.graph,
            skip: this.skip,
            limit: this.limit
        };
    }

    equals(other: Pattern): boolean {
        if (other === null) {
            return false;
        }

        const a = this.toJSON();
        const b = other.toJSON();

        if (a.skip !== b.skip) {
            return false;
        }

        if (a.limit !== b.limit) {
            return false;
        }

        if (a.operations.keys.length !== b.operations.keys.length) {
            return false;
        }

        if (!a.operations.keys.every(keyA => b.operations.keys.some(keyB => keyA === keyB))) {
            return false;
        }

        for (let keyIndexA = 0; keyIndexA < a.operations.keys.length; keyIndexA++) {
            const keyIndexB = b.operations.keys.indexOf(a.operations.keys[keyIndexA]);

            if (!a.operations.values[keyIndexA].every((operationA, index) => {
                const operationB = b.operations.values[keyIndexB][index];
                return JSON.stringify(operationA) === JSON.stringify(operationB);
            })) {
                return false;
            }
        }

        for (let nodeIndexA = 0; nodeIndexA < a.graph.nodes.length; nodeIndexA++) {
            if (a.graph.nodes[nodeIndexA].name !== b.graph.nodes[nodeIndexA].name) {
                return false;
            }

            if (a.graph.nodes[nodeIndexA].content !== b.graph.nodes[nodeIndexA].content) {
                return false;
            }

            for (let relationIndexA = 0; relationIndexA < a.graph.nodes[nodeIndexA].relations.length; relationIndexA++) {
                if (a.graph.nodes[nodeIndexA].relations[relationIndexA].name !== b.graph.nodes[nodeIndexA].relations[relationIndexA].name) {
                    return false;
                }

                if (a.graph.nodes[nodeIndexA].relations[relationIndexA].targetNodeIndex !==
                    b.graph.nodes[nodeIndexA].relations[relationIndexA].targetNodeIndex) {
                    return false;
                }
            }
        }

        return true;
    }
}