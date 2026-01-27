declare module "dotted-map" {
  export type Grid = "diagonal" | "vertical" | "horizontal";

  export interface DottedMapOptions {
    height: number;
    grid?: Grid;
  }

  export interface GetSvgOptions {
    radius?: number;
    color?: string;
    shape?: "circle" | "square";
    backgroundColor?: string;
  }

  export default class DottedMap {
    constructor(options: DottedMapOptions);
    getSVG(options: GetSvgOptions): string;
  }
}
