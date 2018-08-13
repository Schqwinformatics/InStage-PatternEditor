import { PatternBuilder } from "./patternBuilder";
import { MatchOperationItem, ReturnOperationItem, GraphConstants } from "./models";

describe("PatternBuilder Tests", () => {
    let patternBuilder: PatternBuilder;
    let matchItem: MatchOperationItem;
    let matchItem1: MatchOperationItem;
    let returnItem: ReturnOperationItem;

    beforeEach(() => {
        patternBuilder = new PatternBuilder();

        matchItem = {
            nodeIndex: 0
        };

        returnItem = {
            nodeIndex: 1
        };

        matchItem1 = {
            nodeIndex: 1
        };
    });

    describe("When adding nothing", () => {
        it("it should return empty pattern", () => {
            const pattern = patternBuilder.getPattern();

            expect(pattern).toBeDefined();
            expect(pattern.operations.count).toBe(0);
            expect(pattern.graph.nodes).toHaveLength(0);
        });
    });

    describe("When adding an operation", () => {
        it("it should return pattern with an operation", () =>  {
            patternBuilder.addMatchOperation(matchItem);

            const pattern = patternBuilder.getPattern();
            expect(pattern.operations.count).toBe(1);
        });
    });

    describe("When adding paging", () => {
        it("should return with skip and limit set", () => {
            patternBuilder.setLimit(10);
            patternBuilder.setSkip(5);

            const pattern = patternBuilder.getPattern();
            expect(pattern.skip).toBe(5);
            expect(pattern.limit).toBe(10);
        });
    });

    describe("When adding multiple operations", () => {
        it("it should return pattern with all operations", () =>  {
            patternBuilder.addMatchOperation(matchItem);
            patternBuilder.addReturnOperation(returnItem);

            const pattern = patternBuilder.getPattern();
            expect(pattern.operations.count).toBe(2);
        });

        it("it should have added indices to existing operations", () =>  {
            patternBuilder.addMatchOperation(matchItem);
            patternBuilder.addMatchOperation(matchItem1);

            const pattern = patternBuilder.getPattern();
            expect(pattern.operations.count).toBe(1);
            expect(pattern.operations.item('MATCH')).toHaveLength(2);
            expect(pattern.operations.item('MATCH')).toEqual([matchItem, matchItem1]);
        });
    });
});