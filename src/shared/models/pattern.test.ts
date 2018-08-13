import { Pattern, PatternDto, Operations, OperationItem, NodeIndex, MatchOperationItem, ReturnOperationItem } from "./pattern";
import { Dictionary } from "../dictionary";
import { PatternBuilder } from '..';
import { RelationIndex } from ".";

describe("pattern tests", () => {
    it("should work with serialization", () => {
        let pattern = new Pattern({
                nodes: [
                    { name: "User", relations: [] },
                    { name: "Ivan", relations: [{name: "IS_A", targetNodeIndex: 0}]}
                ]
            } ,
            new Dictionary<Operations, OperationItem[]>(),
        );
        let matchIvan: MatchOperationItem = {
            nodeIndex: 1
        };
        let returnIvan: ReturnOperationItem = {
            nodeIndex: 1
        };
        let returnIsaRelation: ReturnOperationItem = {
            relationIndex: [1, 0]
        };
        let returnUser: ReturnOperationItem = {
            nodeIndex: 0
        };
        pattern.operations.add('MATCH', [matchIvan]);
        pattern.operations.add('RETURN', [returnIvan, returnIsaRelation, returnUser]);

        let serialized = JSON.stringify(pattern);

        let dto = JSON.parse(serialized) as PatternDto;
        let deserializedPattern = Pattern.fromDto(dto);

        expect(deserializedPattern.operations.keys).toContain("MATCH");
        expect(deserializedPattern.operations.keys).toContain("RETURN");
    });

    it('should recognize equal patterns', () => {
        const patternBuilder = new PatternBuilder();
        const nodeA = patternBuilder.addNode("A");
        const nodeB = patternBuilder.addNode("B");
        const nodeC = patternBuilder.addNode("C");

        const relationX = patternBuilder.addRelation(nodeA.nodeIndex, nodeB.nodeIndex, 'X');
        const relationY = patternBuilder.addRelation(nodeA.nodeIndex, nodeB.nodeIndex, 'Y');
        const relationZ = patternBuilder.addRelation(nodeB.nodeIndex, nodeC.nodeIndex, 'Z');

        patternBuilder.addCreateOperation({ nodeIndex: nodeA.nodeIndex });
        patternBuilder.addMatchOperation({ relationIndex: relationX.relationIndex });
        patternBuilder.addReturnOperations([
            { nodeIndex: nodeB.nodeIndex },
            { relationIndex: relationY.relationIndex },
            { relationIndex: relationZ.relationIndex }
        ]);

        const a = patternBuilder.getPattern();
        const b = patternBuilder.getPattern();

        expect(a.equals(b)).toBe(true);
    });

    it('should recognize unequal patterns', () => {
        const patternBuilder = new PatternBuilder();
        const nodeA = patternBuilder.addNode("A");
        const nodeB = patternBuilder.addNode("B");
        const nodeC = patternBuilder.addNode("C");

        const relationX = patternBuilder.addRelation(nodeA.nodeIndex, nodeB.nodeIndex, 'X');
        const relationY = patternBuilder.addRelation(nodeA.nodeIndex, nodeB.nodeIndex, 'Y');
        const relationZ = patternBuilder.addRelation(nodeB.nodeIndex, nodeC.nodeIndex, 'Z');

        patternBuilder.addCreateOperation({ nodeIndex: nodeA.nodeIndex });
        patternBuilder.addMatchOperation({ relationIndex: relationX.relationIndex });

        const a = patternBuilder.getPattern();

        patternBuilder.addReturnOperations([
            { nodeIndex: nodeB.nodeIndex },
            { relationIndex: relationY.relationIndex },
            { relationIndex: relationZ.relationIndex }
        ]);

        const b = patternBuilder.getPattern();

        expect(a.equals(b)).toBe(false);
    });

    it("should return stringified permissions", () => {
        let patternBuilderAccessAll: PatternBuilder = new PatternBuilder();
        let accessAllNodeIndex: NodeIndex = patternBuilderAccessAll.addNode();
        let matchAll: MatchOperationItem = { nodeIndex: accessAllNodeIndex.nodeIndex };
        let returnAll: ReturnOperationItem = { nodeIndex: accessAllNodeIndex.nodeIndex };
        patternBuilderAccessAll.addMatchOperation(matchAll);
        patternBuilderAccessAll.addReturnOperation(returnAll);
        let patternForAccessAll: Pattern = patternBuilderAccessAll.getPattern();
        let stringifiedPattern: string = JSON.stringify(patternForAccessAll);
        expect(stringifiedPattern).toContain("MATCH");
        expect(stringifiedPattern).toContain("RETURN");
        expect(stringifiedPattern).toContain("nodeIndex\":0");

        // Permission 1: "MATCH (n {name: 'DynamicSchemaNode' }) RETURN n as permissions";
        let patternBuilderForPermission1: PatternBuilder = new PatternBuilder();
        let dynSnIndex: NodeIndex = patternBuilderForPermission1.addNode("DynamicSchemaNode");
        let matchDynsn: MatchOperationItem = { nodeIndex: dynSnIndex.nodeIndex };
        patternBuilderForPermission1.addMatchOperation(matchDynsn);
        let returnDynsn: ReturnOperationItem = { nodeIndex: dynSnIndex.nodeIndex };
        patternBuilderForPermission1.addReturnOperation(returnDynsn);
        let patternForPermission1: Pattern = patternBuilderForPermission1.getPattern();
        let stringifiedPermission1Pattern: string = JSON.stringify(patternForPermission1);
        expect(stringifiedPermission1Pattern).toContain("DynamicSchemaNode");

        // Permission 2: "MATCH ({name: 'DynamicSchemaNode' })<-[:IS_A]-(n {name:'Portal'}) RETURN n as permissions";
        let patternBuilderForPermission2: PatternBuilder = new PatternBuilder();
        let dynSnNodeIndexForP2: NodeIndex = patternBuilderForPermission2.addNode("DynamicSchemaNode");
        let portalNodeIndexForP2: NodeIndex = patternBuilderForPermission2.addNode("Portal");
        let portalToDynSnRelationForP2: RelationIndex = patternBuilderForPermission2.addRelation(
            portalNodeIndexForP2.nodeIndex, dynSnNodeIndexForP2.nodeIndex, "IS_A");
        let matchDynsnForP2: MatchOperationItem = { nodeIndex: dynSnNodeIndexForP2.nodeIndex };
        patternBuilderForPermission2.addMatchOperation(matchDynsnForP2);
        let matchPortalForP2: MatchOperationItem = { nodeIndex: portalNodeIndexForP2.nodeIndex };
        patternBuilderForPermission2.addMatchOperation(matchPortalForP2);
        let matchPortalToDynSnRelationForP2: MatchOperationItem = { relationIndex: portalToDynSnRelationForP2.relationIndex };
        patternBuilderForPermission2.addMatchOperation(matchPortalToDynSnRelationForP2);
        let returnPortalNodeForP2: ReturnOperationItem = { nodeIndex: portalNodeIndexForP2.nodeIndex };
        patternBuilderForPermission2.addReturnOperation(returnPortalNodeForP2);
        let patternForPermission2: Pattern = patternBuilderForPermission2.getPattern();
        let stringifiedPermission2Pattern: string = JSON.stringify(patternForPermission2);
        expect(stringifiedPermission2Pattern).toContain("IS_A");
        expect(stringifiedPermission2Pattern).toContain("DynamicSchemaNode");
        expect(stringifiedPermission2Pattern).toContain("[1,0]");

        // Permission 3: MATCH ({name: 'DynamicSchemaNode' })<-[:IS_A]-({name:'Portal'})<-[:IS_A]-(p) RETURN p as permissions
        let patternBuilderForPermission3: PatternBuilder = new PatternBuilder();
        let dynSnNodeIndexForP3: NodeIndex = patternBuilderForPermission3.addNode("DynamicSchemaNode");
        let portalNodeIndexForP3: NodeIndex = patternBuilderForPermission3.addNode("Portal");
        let portalToDynSnRelationForP3: RelationIndex = patternBuilderForPermission3.addRelation(
            portalNodeIndexForP3.nodeIndex, dynSnNodeIndexForP3.nodeIndex, "IS_A");
        let matchDynsnForP3: MatchOperationItem = { nodeIndex: dynSnNodeIndexForP3.nodeIndex };
        patternBuilderForPermission3.addMatchOperation(matchDynsnForP3);
        let matchPortalForP3: MatchOperationItem = { nodeIndex: portalNodeIndexForP3.nodeIndex };
        patternBuilderForPermission3.addMatchOperation(matchPortalForP3);
        let matchPortalToDynSnRelationForP3: MatchOperationItem = { relationIndex: portalToDynSnRelationForP3.relationIndex };
        patternBuilderForPermission3.addMatchOperation(matchPortalToDynSnRelationForP3);
        let portalContentForP3: NodeIndex = patternBuilderForPermission3.addNode();
        let relationPortalContentToPortalSchemaForP3: RelationIndex = patternBuilderForPermission3.
            addRelation(portalContentForP3.nodeIndex, portalNodeIndexForP3.nodeIndex, "IS_A");
        let matchPortalContentToPortalSchemaRelationForP3: MatchOperationItem = { relationIndex: relationPortalContentToPortalSchemaForP3.relationIndex };
        patternBuilderForPermission3.addMatchOperation(matchPortalContentToPortalSchemaRelationForP3);
        let returnPortalContentNodesForP3: ReturnOperationItem = { nodeIndex: portalContentForP3.nodeIndex };
        patternBuilderForPermission3.addReturnOperation(returnPortalContentNodesForP3);
        let patternForPermission3: Pattern = patternBuilderForPermission3.getPattern();
        let stringifiedPermission3Pattern: string = JSON.stringify(patternForPermission3);
        expect(stringifiedPermission2Pattern).toContain("[1,0]");
        expect(stringifiedPermission2Pattern).toContain("IS_A");
        expect(stringifiedPermission2Pattern).toContain("Portal");
    });

    it("should create my expected pattern and string for bsw permission migration 524", () => {
        let patternBuilder: PatternBuilder = new PatternBuilder();

        // Ebene 1, 2
        let dynamicSchemaNode: NodeIndex = patternBuilder.addNode("DynamicSchemaNode");
        let abwesenheit: NodeIndex = patternBuilder.addNode("Abwesenheit");
        let abteilung = patternBuilder.addNode("Abteilung");

        let relationAbwesenheitToDynamicSchemaNode = patternBuilder.addRelation(abwesenheit.nodeIndex, dynamicSchemaNode.nodeIndex, "IS_A");
        let relationAbteilungToDynamicSchemaNode = patternBuilder.addRelation(abteilung.nodeIndex, dynamicSchemaNode.nodeIndex, "IS_A");

        // Ebene 3
        let staticSchemaNode = patternBuilder.addNode("StaticSchemaNode");
        let unnamedAbwesenheitContentReturn: NodeIndex = patternBuilder.addNode();
        let mitarbeiter = patternBuilder.addNode("Mitarbeiter");
        let unnamedEntwicklungsAbteilungContent = patternBuilder.addNode();

        let relationUnnamedAbwesenheitContentReturnToAbwesenheit = patternBuilder.addRelation(
            unnamedAbwesenheitContentReturn.nodeIndex, abwesenheit.nodeIndex, "IS_A");
        let relationMitarbeiterToAbwesenheit = patternBuilder.addRelation(mitarbeiter.nodeIndex, abwesenheit.nodeIndex, "has");
        let relationMitarbeiterToDynamicSchemaNode = patternBuilder.addRelation(mitarbeiter.nodeIndex, dynamicSchemaNode.nodeIndex, "IS_A");
        let relationUnnamedEntwicklungsAbteilungContentToAbteilung = patternBuilder.addRelation(
            unnamedEntwicklungsAbteilungContent.nodeIndex, abteilung.nodeIndex, "IS_A");

        // Ebene 4
        let user = patternBuilder.addNode("User");
        let unnamedMitarbeiterContent = patternBuilder.addNode();
        let unnamedVerwalterContent = patternBuilder.addNode();

        let relationUserToStaticSchemaNode = patternBuilder.addRelation(user.nodeIndex, staticSchemaNode.nodeIndex, "IS_A");
        let relationMitarbeiterToUser = patternBuilder.addRelation(mitarbeiter.nodeIndex, user.nodeIndex, "has");
        let relationUnnamedMitarbeiterContentToUnnamedAbwesenheitContentReturn = patternBuilder.addRelation(
            unnamedMitarbeiterContent.nodeIndex, unnamedAbwesenheitContentReturn.nodeIndex, "has");
        let relationUnnamedMitarbeiterContentToMitarbeiter = patternBuilder.addRelation(
            unnamedMitarbeiterContent.nodeIndex, mitarbeiter.nodeIndex, "IS_A");
        let relationUnnamedEntwicklungsAbteilungContentToUnnamedMitarbeiterContent = patternBuilder.addRelation(
            unnamedEntwicklungsAbteilungContent.nodeIndex, unnamedMitarbeiterContent.nodeIndex, "contains");
        let relationUnnamedVerwalterContentToMitarbeiter = patternBuilder.addRelation(
            unnamedVerwalterContent.nodeIndex, mitarbeiter.nodeIndex, "IS_A");

        // Ebene 5
        let email = patternBuilder.addNode("Email");

        let relationEmailToStaticSchemaNode = patternBuilder.addRelation(email.nodeIndex, staticSchemaNode.nodeIndex, "IS_A");
        let relationUserToEmail = patternBuilder.addRelation(user.nodeIndex, email.nodeIndex, "has");

        // Ebene 6
        let currentUserEmail = patternBuilder.addNode("$currentUserEmail");

        let relationCurrentUserEmailToEmail = patternBuilder.addRelation(currentUserEmail.nodeIndex, email.nodeIndex, "IS_A");

        // Ebene 7
        let unnamedUserContent = patternBuilder.addNode();

        let relationUnnamedVerwalterContentToUnnamedEntwicklungsAbteilungContent = patternBuilder.addRelation(
            unnamedEntwicklungsAbteilungContent.nodeIndex, unnamedUserContent.nodeIndex, "is_managed_by");

        let relationUnnamedUserContentToCurrentUserEmail = patternBuilder.addRelation(unnamedUserContent.nodeIndex, currentUserEmail.nodeIndex, "has");
        let relationUnnamedUserContentToUser = patternBuilder.addRelation(unnamedUserContent.nodeIndex, user.nodeIndex, "IS_A");
        let relationUnnamedVerwalterContentToUnnamedUserContent = patternBuilder.addRelation(
            unnamedVerwalterContent.nodeIndex, unnamedUserContent.nodeIndex, "has");

        // // Operations
        // let match1: MatchOperationItem = { nodeIndex: dynamicSchemaNode.nodeIndex };
        // let match2 = { nodeIndex: abwesenheit.nodeIndex};
        // let match3 = { nodeIndex: abteilung.nodeIndex};
        // let match4 = { nodeIndex: staticSchemaNode.nodeIndex};
        // let match5 = { nodeIndex: unnamedAbwesenheitContentReturn.nodeIndex};
        // let match6 = { nodeIndex: mitarbeiter.nodeIndex};
        // let match7 = { nodeIndex: unnamedEntwicklungsAbteilungContent.nodeIndex};
        // let match8 = { nodeIndex: user.nodeIndex};
        // let match9 = { nodeIndex: unnamedMitarbeiterContent.nodeIndex};
        // let match10 = { nodeIndex: unnamedVerwalterContent.nodeIndex};
        // let match11 = { nodeIndex: email.nodeIndex};
        // let match12 = { nodeIndex: currentUserEmail.nodeIndex};
        // let match13 = { nodeIndex: unnamedUserContent.nodeIndex};

        // // relationMatches
        // let match14 = { relationIndex: relationAbwesenheitToDynamicSchemaNode.relationIndex };
        // let match15 = { relationIndex: relationAbteilungToDynamicSchemaNode.relationIndex };
        // let match16 = { relationIndex: relationUnnamedAbwesenheitContentReturnToAbwesenheit.relationIndex };
        // let match17 = { relationIndex: relationAbwesenheitToMitarbeiter.relationIndex };
        // let match17a = { relationIndex: relationMitarbeiterToDynamicSchemaNode.relationIndex };
        // let match18 = { relationIndex: relationUnnamedEntwicklungsAbteilungContentToAbteilung.relationIndex };
        // let match19 = { relationIndex: relationUserToStaticSchemaNode.relationIndex };
        // let match20 = { relationIndex: relationMitarbeiterToUser.relationIndex };
        // let match21 = { relationIndex: relationUnnamedMitarbeiterContentToUnnamedAbwesenheitContentReturn.relationIndex };
        // let match22 = { relationIndex: relationUnnamedMitarbeiterContentToMitarbeiter.relationIndex };
        // let match23 = { relationIndex: relationUnnamedEntwicklungsAbteilungContentToUnnamedMitarbeiterContent.relationIndex };
        // let match24 = { relationIndex: relationUnnamedVerwalterContentToMitarbeiter.relationIndex };
        // let match25 = { relationIndex: relationUnnamedVerwalterContentToUnnamedEntwicklungsAbteilungContent.relationIndex };
        // let match26 = { relationIndex: relationEmailToStaticSchemaNode.relationIndex };
        // let match27 = { relationIndex: relationUserToEmail.relationIndex };
        // let match28 = { relationIndex: relationCurrentUserEmailToEmail.relationIndex };
        // let match29 = { relationIndex: relationUnnamedUserContentToCurrentUserEmail.relationIndex };
        // let match30 = { relationIndex: relationUnnamedUserContentToUser.relationIndex };
        // let match31 = { relationIndex: relationUnnamedVerwalterContentToUnnamedUserContent.relationIndex };

        // let allMatcheOperations: Array<MatchOperationItem> =
        //     [match1, match2, match3, match4, match5, match6, match7, match8, match9, match10, match11, match12, match13, match14, match15, match16,
        //     match17, match17a, match18, match19, match20, match21, match22, match23, match24, match25, match26, match27, match28, match29, match30, match31];

        let return1: ReturnOperationItem = { nodeIndex: unnamedAbwesenheitContentReturn.nodeIndex };
        patternBuilder.addAllToMatch();
        // patternBuilder.addMatchOperations(allMatcheOperations);
        patternBuilder.addReturnOperation(return1);

        let patternForVerwalterUrlaubsAnzeige: Pattern = patternBuilder.getPattern();
        let stringifiedPattern: string = JSON.stringify(patternForVerwalterUrlaubsAnzeige);

        expect(stringifiedPattern).toContain("Mitarbeiter");
        expect(stringifiedPattern).toContain("Abteilung");
    });

    it("should create my expected pattern and string for bsw permission migration 527 for verwalter to abteilungs-mitarbeiter", () => {
        let patternBuilder: PatternBuilder = new PatternBuilder();

        let dynamicSchemaNode: NodeIndex = patternBuilder.addNode("DynamicSchemaNode");
        let staticSchemaNode: NodeIndex = patternBuilder.addNode("StaticSchemaNode");
        let abteilung = patternBuilder.addNode("Abteilung");
        let user = patternBuilder.addNode("User");
        let mitarbeiter = patternBuilder.addNode("Mitarbeiter");
        let currentUsersMail = patternBuilder.addNode("$currentUserEmail");
        let emailSchema = patternBuilder.addNode("Email");

        let unnamedMitarbeiter = patternBuilder.addNode();
        let unnamedAbteilung = patternBuilder.addNode();
        let unnamedUser = patternBuilder.addNode();

        let relationUserToSsn = patternBuilder.addRelation(user.nodeIndex, staticSchemaNode.nodeIndex, "IS_A");
        let relationAbteilungToDsn = patternBuilder.addRelation(abteilung.nodeIndex, dynamicSchemaNode.nodeIndex, "IS_A");
        let relationMitarbeiterToDsn = patternBuilder.addRelation(mitarbeiter.nodeIndex, dynamicSchemaNode.nodeIndex, "IS_A");

        let relationUnnamedMitarbeiterToMitarbeiter = patternBuilder.addRelation(unnamedMitarbeiter.nodeIndex, mitarbeiter.nodeIndex, "IS_A");
        let relationUnnamedAbteilungToAbteilung = patternBuilder.addRelation(unnamedAbteilung.nodeIndex, abteilung.nodeIndex, "IS_A");
        let relationUnnamedUserToUser = patternBuilder.addRelation(unnamedUser.nodeIndex, user.nodeIndex, "IS_A");

        let relationUnnamedAbteilungContainsUnnamedMitarbeiter = patternBuilder.addRelation(
            unnamedAbteilung.nodeIndex, unnamedMitarbeiter.nodeIndex, "contains");
        let relationUnnamedAbteilungIsManagedByUnnamedUser = patternBuilder.addRelation(
            unnamedAbteilung.nodeIndex, unnamedUser.nodeIndex, "is_managed_by");
        let relationUnnamedUserHasCurrentEmail = patternBuilder.addRelation(
            unnamedUser.nodeIndex, currentUsersMail.nodeIndex, "has");
        let relationCurrentMailIsaEmail = patternBuilder.addRelation(
            currentUsersMail.nodeIndex, emailSchema.nodeIndex, "IS_A");

        let returnAssociatedMitarbeiter: ReturnOperationItem = { nodeIndex: unnamedMitarbeiter.nodeIndex };
        patternBuilder.addAllToMatch();
        patternBuilder.addReturnOperation(returnAssociatedMitarbeiter);

        let patternForVerwalterAssociatedMitarbeiter: Pattern = patternBuilder.getPattern();
        let stringifiedPattern: string = JSON.stringify(patternForVerwalterAssociatedMitarbeiter);

        expect(stringifiedPattern).toContain("Mitarbeiter");
        expect(stringifiedPattern).toContain("Abteilung");
        expect(stringifiedPattern).toContain("User");
    });
});