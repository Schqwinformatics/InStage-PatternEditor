import { PatternEditorAction } from '../shared/patternEditorAction';
import { CodeToPatternParser } from '../shared/GraphFormatParsers/t2pParser';
import { PatternToNetworkParser } from '../shared/GraphFormatParsers/p2visParser';
import { visualEditorEdge, visualEditorNode } from '../visualEditor/visualEditor.reducer';

export enum ActionTypes {
    CHANGE_TEXT = 'PATTERNEDITOR.UPDATE.TEXT',
    PARSE = 'PATTERNEDITOR.PARSE.TEXT',
    PARSINGFAILED = 'PATTERNEDITOR.PARSE.FAILED',
    TICK = 'PATTERNEDITOR.TICK',
}

enum PatternOperationTypes {
    ADD_NODE = 'addNode',
    ADD_EDGE = 'addRelation',
}

export interface UpdateTextAction extends PatternEditorAction {
    newText: string;
}

export interface ParseAction extends PatternEditorAction {
    nodes: visualEditorNode[];
    edges: visualEditorEdge[];
}

export interface ParsingFailedAction extends PatternEditorAction {

}

export interface TickAction extends PatternEditorAction {

}

export function updateText(text: string): UpdateTextAction {
    return {
        type: ActionTypes.CHANGE_TEXT,
        newText: text
    };
}

export function tick(textAlreadyParsed: boolean): TickAction {
    return {
        type: ActionTypes.TICK
    };
}

export function parse(text: string): PatternEditorAction {

    let pattern = CodeToPatternParser.parse(text);

    if (!pattern) {
        let failedAction: ParsingFailedAction = {
            type: ActionTypes.PARSINGFAILED
        };

        return failedAction;
    } else {
        let data = PatternToNetworkParser.parsePattern(pattern);
        let parseAction: ParseAction = {
            type: ActionTypes.PARSE,
            nodes: data.nodes,
            edges: data.edges
        };

        return parseAction;
    }
}

function findStartOfOperation(lineOfCode: string): {start: number, operation: string} {
    if (lineOfCode.indexOf(PatternOperationTypes.ADD_NODE) > -1) {
        return {
            start: lineOfCode.indexOf(PatternOperationTypes.ADD_NODE),
            operation: PatternOperationTypes.ADD_NODE
        };
    }
    if (lineOfCode.indexOf(PatternOperationTypes.ADD_EDGE) > -1) {
        return {
            start: lineOfCode.indexOf(PatternOperationTypes.ADD_EDGE),
            operation: PatternOperationTypes.ADD_EDGE
        };
    }

    return null;
}