const express = require('express');
const router = express.Router();

//Article model
let Comment = require('../models/comment');
let Article = require('../models/article');
let Like = require('../models/like');

//Add Route
router.get('/add', function(req,res){
  if(req.user){
    if(req.user.role == 'admin'){
      res.render('add_article',{
          title: 'Add Articles'
      });
    }else {
      res.redirect('/');
    }
  }else{
    req.flash('error','You must authenticate');
    res.redirect('/users/login');
  }
});


// Add article POST Route
router.post('/add',function(req,res){
  req.checkBody('title','Title is required').notEmpty();
  req.checkBody('author','Author is required').notEmpty();
  req.checkBody('body','body is required').notEmpty();

  // Get errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_article',{
      title:'Add Article',
      errors:errors
    });
  }else{
    let article = new Article();
    let visibility = "hidden";//For default, it's hidden
    let date = new Date() ;

    article.title = req.body.title;
    article.body = req.body.body;
    article.author = req.body.author;
    article.date = date;
    article.visibility = visibility;

    article.save(function(err){
      if(err){
        console.log(err);
        return;
      }else{
        req.flash('success', 'Article Added');
        res.redirect('/');
      }
    });
  }
});

//Edit Form GET Route
router.get('/edit/:id',function(req,res){

  if(req.user){
      if(req.user.role == 'admin'){
        Article.findById(req.params.id, function(err, article){
          res.render('edit_article',{
              title: 'Edit Article',
              article: article
          });
      });
      }else{
          res.redirect('/');
      }
  }else{
    req.flash('error','You must authenticate');
    res.redirect('/users/login');
  }
});

// Edit Submit POST Route
router.post('/edit/:id',function(req,res){
  let article = {};

  article.title = req.body.title;
  article.body = req.body.body;
  article.author = req.body.author;
  article.visibility = req.body.visibility;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    }else{
      req.flash('success','Article Update');
      res.redirect('/');
    }
  });
  return;
});

//DELETE POST With Delete methods
router.delete('/:id',function(req,res){
  if(req.user.role == 'admin'){
    let query = {_id:req.params.id}

    Article.remove(query, function(err){
      if(err){
        console.log(err);
      }else{
        req.flash('success','Article Deleted');
        res.send('Success');
      }
    });
    }
});

//Get Single Article /article/:id
router.get('/:id',function(req,res){
  if(req.user){
    Comment.find({article_id: req.params.id}, function(err, comment){
      var likeUserOnArticle = Like.find({username: req.user.username, article:req.params.id}).count(function (e, count) {
          Article.findById(req.params.id, function(err, article){
            res.render('article',{
                article: article,
                like: count,
                comment: comment
            });
          });
        });
    });
}else{
  req.flash('error','You must authenticate');
  res.redirect('/users/login');
}
});

// Methods Post for like
router.post('/:id',function(req,res){
  //check the like
  var likeUserOnArticle = Like.find({username: req.user.username, article:req.params.id}).count(function (e, count) {
        if(count == 0){
          // for the add likes
          let like = new Like();
          like.username = req.user.username;
          like.article = req.params.id;

          like.save(function(err){
            if(err){
              console.log(err);
              return;
            }else{
              req.flash('success', 'Article Liked ');
              res.redirect('/'+req.params.id);
            }
            });
        }
        else if (count == 1) {
            let query = {username: req.user.username, article:req.params.id}
            Like.remove(query, function(err){
              if(err){
                console.log(err);
              }else{
                req.flash('success','Article Disliked');
                res.send('Success');
              }
            });
        }
    });
    return;
});

module.exports = router;
