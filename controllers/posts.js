const Post = require('../models/post');
const user = require('../models/user');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
exports.createPost =(req, res)=>{
     const errors = validationResult(req);
     if(!errors.isEmpty()){
          const error = new Error("Validation failed , entered data is incorrect.");
          console.log(errors.toString());
          error.statusCode= 422 ; //error in validation code
          throw error ;
     }
    /* if (!req.file) {
          const error = new Error('No image provided.');
          error.statusCode = 422;
          throw error;
        }*/
     const title = req.body.title;
     const content = req.body.content;
     const image = req.file.path;
   //  let creator ;
     const post = new Post({
          title : title ,
          image : image ,
          content : content ,
        //  creator : req.userId 
     });
      post.save()/*.then(
          result =>{
               return user.findById(req.userId);
          }).then(user =>
               {
                    user.posts.push(post);
                    return user.save();
               })*/.then(result => {
                    res.statusCode(200).json({
                         message  :"post created alright hamdoulillah",
                         post : post,
                        // creator : creator
                    });
               })
               .catch(
          err =>{
               if(!err.statusCode){
                    err.statusCode =500;
               }
               //next(err);
          }
     );
     
};

exports.getPosts  = (req, res)=>{
     Post.find().then(posts =>{
          res.statusCode(200).json({
               message : 'here is the posts',
               posts : posts,
          }).catch(err =>{
               if(!err.statusCode){
                    err.statusCode = 500
               }
               next(err);
          });
     });
};
exports.getPost = (req, res)=>{
     const postId = req.params.postId;
     Post.findById(postId).then(post =>
          {
               if(!post){
                    const error = new Error('could not find this post sadly');
                    error.statusCode= 404 ;
                    throw error ;
               }
                res.statusCode(200).json({
                    message : 'here\'s your post',
                    post : post,
               })
          }).catch(err =>{
               if(!err.statusCode){
                    err.statusCode=500 ;
               }
               next(err);
          });
};
exports.updatePost = (req, res)=> {
     const postId = req.params.postId;
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          const error = new Error('Validation failed, entered data is incorrect.');
          error.statusCode = 422;
          throw error;
        }
     const title = req.body.title;
     const content = req.body.content;
     let imageUrl = req.body.image;
     if (req.file) {
          imageUrl = req.file.path;
        }
        if (!imageUrl) {
          const error = new Error('No file picked.');
          error.statusCode = 422;
          throw error;
        }
     Post.findById(postId).then(post => {
          if(!post){
               const error = new Error('Could not find post.');
               error.statusCode = 404;
               throw error;
          }
          if (post.creator.toString() !== req.userId) {
               const error = new Error('Not authorized!');
               error.statusCode = 403;
               throw error;
             }
          if (imageUrl !== post.image) {
               clearImage(post.image);
             }
          post.title = title;
          post.imageUrl = imageUrl;
          post.content = content;
          return post.save();
     })
     .then(result => {
       res.status(200).json({ message: 'Post updated!', post: result });
     })
     .catch(err => {
       if (!err.statusCode) {
         err.statusCode = 500;
       }
       next(err);
     });
};

exports.deletePost = (req, res, next) => {
     const postId = req.params.postId;
     Post.findById(postId)
       .then(post => {
         if (!post) {
           const error = new Error('Could not find post.');
           error.statusCode = 404;
           throw error;
         }
         if (post.creator.toString() !== req.userId) {//req,userId mafhemtch mnin 9a3da tji
           const error = new Error('Not authorized!');
           error.statusCode = 403;
           throw error;
         }
         // Check logged in user
         clearImage(post.imageUrl);//why ? maw ki nfassa5 el post el image tettefsa5 betbi3etha
         return Post.findByIdAndRemove(postId);
       })
       .then(result => {
         return User.findById(req.userId);
       })
       .then(user => {
         user.posts.pull(postId);
         return user.save();
       })
       .then(result => {
         res.status(200).json({ message: 'Deleted post.' });
       })
       .catch(err => {
         if (!err.statusCode) {
           err.statusCode = 500;
         }
         next(err);
       });
   };

const clearImage = filePath => {
     filePath = path.join(__dirname, '..', filePath);
     fs.unlink(filePath, err => console.log(err));
   };