import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import PackageController from './app/controllers/PackageController';
import PackageAvailableController from './app/controllers/PackageAvailableController';
import PackageDeliveredController from './app/controllers/PackageDeliveredController';
import DeliveryStartController from './app/controllers/DeliveryStartController';
import DeliveryEndController from './app/controllers/DeliveryEndController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import ProblemController from './app/controllers/ProblemController';
import NotificationController from './app/controllers/NotificationController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Login
routes.post('/sessions', SessionController.store);

// Routes for the deliveryman to list the packages, make the withdrawal and inform the delivery
routes.get('/deliveryman/:id', PackageAvailableController.index);
routes.get('/deliveryman/:id/packages', PackageDeliveredController.index);
routes.put(
  '/deliveryman/:deliveryman_id/package/:package_id/start/',
  DeliveryStartController.update
);
routes.put(
  '/deliveryman/:deliveryman_id/package/:package_id/end',
  DeliveryEndController.update
);

// Upload a signature and avatar
routes.post('/files', upload.single('file'), FileController.store);

// Routes for the deliveryman to list and register the problems of a package
routes.post('/delivery/:id/problems', DeliveryProblemController.store);
routes.get('/delivery/:id/problems', DeliveryProblemController.show);

routes.use(authMiddleware);

// Routes for dealing with admin users
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);
routes.get('/users/:id', UserController.show);

// Routes for dealing with recipients
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);
routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);

// Routes for dealing with deliverymans
routes.post('/deliverymans', DeliverymanController.store);
routes.put('/deliverymans/:id', DeliverymanController.update);
routes.delete('/deliverymans/:id', DeliverymanController.delete);
routes.get('/deliverymans', DeliverymanController.index);
routes.get('/deliverymans/:id', DeliverymanController.show);

// Routes for handling with packages
routes.post('/packages', PackageController.store);
routes.put('/packages/:id', PackageController.update);
routes.delete('/packages/:id', PackageController.delete);
routes.get('/packages', PackageController.index);
routes.get('/packages/:id', PackageController.show);

// Route for listing all packages with problems
routes.get('/delivery', DeliveryProblemController.index);

// Route for cancellation of packages
routes.delete('/problem/:id/cancel-delivery', ProblemController.delete);

// Routes to send notifications to deliverymans, possible future use
routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

export default routes;
