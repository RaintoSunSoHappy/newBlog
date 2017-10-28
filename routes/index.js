var express = require('express');
var crypto = require('crypto');//加密解密
var User = require('../models/user');
var Post = require('../models/post');


var router = express.Router();
/* GET home page. */
/*router.all('/', (req, res, next) => {
    console.log('all response!');
    next();
    res.render('index', {title: '首页'});
});*/
router.get('/', (req, res) => {
    Post.get(null,function (err,posts) {
        if(err){
            posts = [];
        }
        res.render('index', {title: '首页',posts:posts,layout:'layout2'});
    });
   // res.render('index', {title: '首页',layout:'layout2'});
});
/*
展示用户发表的所有内容
首先检查用户是否存在，如果存在则从数据库中获取该用户的微博，最后通
过 posts 属性传递给 user 视图
 */
router.get('/u/:user', (req, res) => {
    //获取用户信息
    User.get(req.params.user,function (err,user) {
        if(!user){
            req.flash('error','用户不存在');
            return res.redirect('/');
        }
        //获取用户发表的内容
        //是首先检查用户是否存在，如果存在则从数据库中获取该用户的微博，最后通
        //过 posts 属性传递给 user 视图
        Post.get(user.name,function (err,posts) {
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            res.render('user',{title:user.name,posts:posts,layout:'layout2'});
        });
    });
});
/*
这段代码通过 req.session.user 获取当前用户信息，从 req.body.post 获取用
户发表的内容，建立 Post 对象，调用 save() 方法存储信息，最后将用户重定向到用户
页面
 */
router.post('/post',checkLogin);
router.post('/post', (req, res) => {
    var currentUser = req.session.user;
    var post = new Post(currentUser.name,req.body.post);
    post.save(function (err) {
        if(err){
            req.flash('error',err);
            return res.redirect('/');
        }
        req.flash('success','发表成功');
        //res.redirect('/u/'+currentUser.name);
        res.redirect('/');
    });
});
router.get('/reg', checkNotLogin);
router.get('/reg', (req, res) => {
    res.render('reg', {title: '注册页面',layout:'layout2'});
});
router.post('/reg',checkNotLogin);
router.post('/reg', (req, res) => {
    //检验用户两次输入的口令是否一致,POST 请求信息解析过后的对象,req.body
    if (req.body['password-repeat'] != req.body['password']) {
        req.flash('error', '两次输入的口令不一致');
        //重定向功能
        return res.redirect('/reg');
    }
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = new User({

        name:req.body.username,
        password:password,
    });
    //检查用户是否存在
    User.get(newUser.name,function (err,user) {
        if(user){
            err = 'User already exists.';
        }
        if(err){
            req.flash('error',err);
            return res.redirect('/reg');
        }
        //如果不存在则新增用户
        newUser.save(function (err) {
            if(err){
                req.flash('error',err);
                return res.redirect('/reg');
            }
            req.session.user = newUser;
            req.flash('success','注册成功');
            res.redirect('/');
        })
    })
});
router.get('/login', checkNotLogin);
router.get('/login', (req, res) => {
    res.render('login', {title: '登录页面', layout:'layout2'});
});
router.post('/login', checkNotLogin);
router.post('/login', (req, res) => {
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    User.get(req.body.username, function(err, user) {
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/login');
        }
        if (user.password != password) {
            req.flash('error', '用户口令错误');
            return res.redirect('/login');
        }
        req.session.user = user;
        req.flash('success', '登入成功');
        res.redirect('/');
    });
});
router.get('/logout', checkLogin);
router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success', '登出成功');
    res.redirect('/');
});
/*
权限控制，为页面设置访问权限，通过调用 next() 转移控制
 */
function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登入');
        return res.redirect('/login');
    }
    next();
}
function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登入');
        return res.redirect('/');
    }
    next();
}

module.exports = router;
