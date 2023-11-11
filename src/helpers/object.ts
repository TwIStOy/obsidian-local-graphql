export const asField =
    <T extends string>(name: T) =>
    <U>(
        value: U
    ): {
        [K in T]: U;
    } => {
        return {
            [name]: value,
        } as any;
    };

export function getProp<T, FieldName extends keyof T>(fileName: FieldName) {
    return (obj: T) => {
        return obj[fileName];
    };
}
