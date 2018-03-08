/// <reference types="express" />
import { RequestHandler } from 'express';
export interface MemVizOptions {
    frequency: number;
    maxCount: number;
    maxAge: number;
}
export declare const validateInterval: (freq: number) => number;
export declare const validateMaxCount: (maxCount: number) => number;
export declare const validateMaxAge: (maxAge: number) => number;
export declare const memviz: (opts: MemVizOptions) => RequestHandler;
export default memviz;
