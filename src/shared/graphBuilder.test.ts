import { GraphBuilder } from "./graphBuilder";

describe("GraphBuilder Tests", () => {
    let graphBuilder: GraphBuilder;

    beforeEach(() => {
        graphBuilder = new GraphBuilder();
    });

    describe("When adding nothing", () => {
        it("it should return empty graph", () => {
            let graph = graphBuilder.getGraph();

            expect(graph).toBeDefined();
            expect(graph.nodes).toHaveLength(0);
        });
    });

    describe("When adding two nodes", () => {
        it("it should return graph with two nodes", () =>  {
            graphBuilder.addNode("User");
            graphBuilder.addNode("Ivan");

            let graph = graphBuilder.getGraph();
            expect(graph.nodes).toHaveLength(2);
        });

        it("it should return two unique node ids", () => {
            let userNodeId = graphBuilder.addNode("User");
            let ivanNodeId = graphBuilder.addNode("Ivan");

            expect(userNodeId).toBeDefined();
            expect(ivanNodeId).toBeDefined();
            expect(userNodeId).not.toBe(ivanNodeId);
        });
    });

    describe("When adding relation", () => {
        it("should return relation", () => {
            let bastiId = graphBuilder.addNode("Basti");
            graphBuilder.addRelation(bastiId.nodeIndex, bastiId.nodeIndex, "IS");

            let graph = graphBuilder.getGraph();

            expect(graph.nodes[bastiId.nodeIndex].relations).toBeDefined();
            expect(graph.nodes[bastiId.nodeIndex].relations).toHaveLength(1);
        });
    });
});