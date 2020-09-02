
declare module "*.svg" {
    const value: string;
    export = value;
}

declare module "*.png" {
    const value: string;
    export = value;
}

declare module "raw-loader!*" {
    const value: string;
    export default value;
}

declare module "*.md" {
    const value: string;
    export default value;
}
