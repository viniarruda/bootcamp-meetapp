import { Router } from 'express';

import AuthController from './app/controllers/AuthController';
import UserController from './app/controllers/UserController';

const routes = new Router();

routes.post('/auth', AuthController.store);
routes.post('/users', UserController.store);

export default routes;
