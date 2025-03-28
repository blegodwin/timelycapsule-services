import { Router } from 'express';

export type RouterFunction = (router: Router) => void;
