export function isObjectEmpty(obj: Record<string, any>): boolean {
    if (obj === null || obj === undefined) {
        return true;
    }
    return Object.keys(obj).length === 0;
}


export function buildFlexibleRegex(input) {
    const sanitizedInput = input.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&"); // Escape special regex characters
    const pattern = sanitizedInput.split('').join('[\\s.-]*'); // Allow optional spaces, dots, and hyphens between characters
    return new RegExp(pattern, 'i'); // Case-insensitive matching
}