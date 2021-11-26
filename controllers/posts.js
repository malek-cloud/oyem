const Post = require('../models/post');
const Employee = require('../models/employee');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
exports.createPost = async (req, res)=> {
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
     const employeeId = req.body.employeeId;
     //const image = req.file.path;
     let creator ;
     let owner ;
     const post = new Post({
          title : title ,
         /* image : image ,*/
          content : content ,
          creator : employeeId
     });
      post.save().then(
          result =>{
               return Employee.findById(employeeId);
          }).then(employee =>
               {
                    owner = employee ; 
                    employee.posts.push(post);
                    return employee.save();
               }).then(result => {
                    res.statusCode(200).json({
                         message  :"post created alright hamdoulillah",
                         post : post,
                         employe : owner
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
          res.json({
               message : 'here is the posts',
               posts : posts,
          })})}
          /*.catch(
     err =>{
          if(!err.statusCode){
               err.statusCode =500;
          }
     });
}*/
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
          if (post.creator.toString() !== req.employeeId) {
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
         if (post.creator.toString() !== req.employeeId) {//req,employeeId mafhemtch mnin 9a3da tji
           const error = new Error('Not authorized!');
           error.statusCode = 403;
           throw error;
         }
         // Check logged in employee
         clearImage(post.imageUrl);//why ? maw ki nfassa5 el post el image tettefsa5 betbi3etha
         return Post.findByIdAndRemove(postId);
       })
       .then(result => {
         return employee.findById(req.employeeId);
       })
       .then(employee => {
         employee.posts.pull(postId);
         return employee.save();
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


   