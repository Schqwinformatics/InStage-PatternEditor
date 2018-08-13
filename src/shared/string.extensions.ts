export class StringExtensions {
    public static IsNullOrWhitespace(s: string): boolean {
        return !s || !s.trim();
    }
}