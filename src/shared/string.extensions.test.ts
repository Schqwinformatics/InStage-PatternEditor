import { StringExtensions } from "./string.extensions";

describe("String Extension Tests", () => {
    describe("When_testing_if_string_is_null_or_whitespace", () => {
        it ("should return true if string is null", () => {
            expect(StringExtensions.IsNullOrWhitespace(null)).toBe(true);
        });

        it ("should return true if string is empty", () => {
            expect(StringExtensions.IsNullOrWhitespace("")).toBe(true);
        });

        it ("should return true if string is only whitespace", () => {
            expect(StringExtensions.IsNullOrWhitespace("    ")).toBe(true);
        });

        it ("should return false if string is contains value", () => {
            expect(StringExtensions.IsNullOrWhitespace(" e   ")).toBe(false);
        });
    });
});