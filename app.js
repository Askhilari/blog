//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const date = require("date");
const _ = require("lodash");
const multer = require("multer");
const favicon = require("serve-favicon");
const path = require("path");
require('dotenv').config();



// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/uploads"); // Specify the destination folder for storing uploaded files
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname); // Use the original filename for the uploaded file
  }
});

// Create the multer upload instance
const upload = multer({ storage: storage });


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "";
const contactContent = "";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.static("public")); // Serve static files from the "public" folder

// Add the multer middleware to handle file uploads
app.use(upload.single("postImage")); // Specify the name attribute of your file input field
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});
// let posts = [];

const postSchema = {
  title: String,
  content: String,
  date: String, // New field for storing the date
  image: String // Add a new field for the image URL
}

const Post = mongoose.model("Post", postSchema);



app.get("/", function(req, res){

  Post.find({}).exec().then(function(foundPosts) {

    // if(foundPosts.length === 0){
    //   Post.insertMany(defaultPost).then(function () {
    //     console.log("Successfully saved to DB");
    //   }).catch(function(err){
    //     console.log(err);
    //   });
    // }


      res.render("home", {
        posts: foundPosts
      });
    })
    .catch(function(err) {
      console.log(err);
    });

});






app.get("/about", function(req, res){
  res.render("about",{ aboutStarting : aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact",{ contactStarting : contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.get("/toc", function(req, res) {
  res.render("toc");
});

app.get("/privacy", function(req, res) {
  res.render("privacy");
});


// app.post("/compose", function(req, res){
//   const ptitle = req.body.postTitle;
//   const pcontent = req.body.postBody;
//   const pimg = req.file.filename // Store the image URL (filename in this example)
//
//   const post = new Post({
//     title: ptitle,
//     content: pcontent,
//     date: new Date().toISOString() // Convert Date object to string
//   });
//   post.save();
//   res.redirect("/");
// });

app.post("/compose", function(req, res) {
  const { postTitle, postBody } = req.body;
  const file = req.file;

  let filename = "";
  if (file) {
    filename = file.filename;
  }

  const post = new Post({
    title: postTitle,
    content: postBody,
    image: filename, // Store the filename in the 'image' field of the Post model
    date: new Date().toISOString() // Convert Date object to string
  });

  post.save()
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

// app.get("/posts/:postName", function(req, res){
//   const requestedTitle = _.lowerCase(req.params.postName);
//
//   Post.findOne({ title: { $regex: new RegExp(requestedTitle, "i") } }).exec()
//     .then(function(foundPost) {
//       if (foundPost) {
//         res.render("post", {
//           title: foundPost.title,
//           content: foundPost.content
//         });
//       } else {
//         res.send("No post found.");
//       }
//     })
//     .catch(function(err) {
//       console.log(err);
//     });
// });

app.get("/posts/:postName", function(req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);

  Post.findOne({ title: { $regex: new RegExp(requestedTitle, "i") } })
    .exec()
    .then(function(foundPost) {
      if (foundPost) {
        res.render("post", {
          title: foundPost.title,
          content: foundPost.content,
          image: foundPost.image // Pass the image field to the post.ejs template
        });
      } else {
        res.send("No post found.");
      }
    })
    .catch(function(err) {
      console.log(err);
    });
});
















app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
