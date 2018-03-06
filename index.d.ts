/// <reference types="express" />
import { RequestHandler } from 'express';
export interface MemVizOptions {
    frequency: number;
}
export declare const memviz: (opts: MemVizOptions) => RequestHandler;
export default memviz;
