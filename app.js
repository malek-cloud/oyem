const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');

const app = express();
const fileStorage = multer.diskStorage({
  destination : (req,file,cb)=>{
    cb(null, 'images')
  },
  filename : (req, file, cb)=>{
    cb(null, new Date().toISOString +'-'+file.originalname);
  }
});
const fileFilter = (req, file, cb)=>{
  if(
    file.mimetype === 'image/png' ||
    file.mimetype ==='image/jpg' ||
    file.mimetype ==='image/png'||
    file.mimetype ==='video/mp4'||
    file.mimetype ==='video/mkv'||
    file.mimetype ==='audio/mp3'||
    file.mimetype === 'audio/wav'
  ){
    cb(null,true);
  }
  else {
    cb(null,false);
  }
};


app.use(bodyParser.urlencoded({extended: true})); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use('/images', express.static(path.join(__dirname,'images')));

app.use(multer({storage: fileStorage, fileFilter:fileFilter }).single('image'));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    'mongodb+srv://malek-02:wL2Y3cu2xeF3HIym@cluster0.2mjlv.mongodb.net/OyemUnity?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(result => {
    app.listen(5000);
  })
  .catch(err => console.log(err));
