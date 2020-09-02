
export type BaseUpdateDto<T> = {
    add?: T[],
    update?: T[],
    remove?: string[],
};
