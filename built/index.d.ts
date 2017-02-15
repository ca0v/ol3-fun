declare module "ol3-fun/common" {
    export function parse<T>(v: string, type: T): T;
    export function getQueryParameters(options: any, url?: string): void;
    export function getParameterByName(name: string, url?: string): string;
    export function doif<T>(v: T, cb: (v: T) => void): void;
    export function mixin<A extends any, B extends any>(a: A, b: B): A & B;
    export function defaults<A extends any, B extends any>(a: A, ...b: B[]): A & B;
    export function cssin(name: string, css: string): () => void;
    export function debounce(func: () => void, wait?: number): () => void;
    export function html(html: string): HTMLElement;
}
declare module "ol3-fun/examples/index" {
    export function run(): void;
}
declare module "ol3-fun/ol3-polyline" {
    class PolylineEncoder {
        precision: number;
        stride: number;
        constructor(precision?: number, stride?: number);
        private flatten(points);
        private unflatten(nums);
        round(nums: number[]): number[];
        decode(str: string): number[][];
        encode(points: number[][]): string;
    }
    export = PolylineEncoder;
}
declare module "ol3-fun/snapshot" {
    import ol = require("openlayers");
    class Snapshot {
        static render(canvas: HTMLCanvasElement, feature: ol.Feature): void;
        static snapshot(feature: ol.Feature): string;
    }
    export = Snapshot;
}
