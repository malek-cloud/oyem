const express = require('express');
const { body } = require('express-validator');
const postsControllers = require('../controllers/posts');
const isAuth = require('../middleware/isAuth');


const router = express.Router();

router.post(
     '/createPost',
   //  body('content').trim().isLength({min :10, max : 2000}),
     postsControllers.createPost
 );
router.get('/posts', postsControllers.getPosts);
router.get('/post/:postId', postsControllers.getPost);

router.put(
     '/post/:postId',
     isAuth,
     body('content')
      .trim()
      .isLength({ min: 5 }),
     postsControllers.updatePost);

 router.delete('/post/:postId', isAuth, postsControllers.deletePost);

module.exports = router;