import { Pattern } from "../../../shared/models";
import { PatternBuilder } from '../../../shared/patternBuilder';

export class CodeToPatternParser {

    public static parse(code: string): Pattern {

        let result: Pattern = undefined;

        let jsCode = code.split("const").join("var");

        try {
            const patternBuilder = new PatternBuilder();
            eval(jsCode);
            result = patternBuilder.getPattern();
            return result;
        } catch (exception) {
            return undefined;
        }
    }
}