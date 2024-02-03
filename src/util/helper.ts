export function isObjectEmpty(obj: Record<string, any>): boolean {
    console.log(obj);
    if (obj === null || obj === undefined) {
        return true;
      }
    return Object.keys(obj).length === 0;
}