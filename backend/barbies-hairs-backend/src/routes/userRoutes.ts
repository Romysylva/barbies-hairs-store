import express from 'express';
import * as userControllers from '../controllers/userController.js';

import * as authControlers from '../middlewares/authmiddleware.js';
import authorizeRoles from '../middlewares/authroles.js';
import * as imageController from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(authControlers.protect);
router
  .route('/')
  .get(authorizeRoles('admin', 'mananger'), userControllers.getAllUsers)
  .post(userControllers.createsUser);
router.route('/me').get(userControllers.getMe);
router
  .route('/update-me')
  .patch(
    imageController.uploadUserPhoto,
    imageController.resizeUserPhoto,
    userControllers.updateMe,
  );
router.route('/delete-me').delete(userControllers.deleteMe);
router
  .route('/:id')
  .get(userControllers.getUser)
  .patch(
    imageController.uploadUserPhoto,
    imageController.resizeUserPhoto,
    userControllers.updatedUser,
  )
  .delete(userControllers.deleteUser);

router.patch('/update-password', userControllers.passwordUpdapte);

export default router;
