var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var partials = require('express-partials');
var session = require('express-session');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo');
var settings = require('./dbconfig');
var index = require('./routes/index');
var users = require('./routes/users');
var config = require('./dbconfig');
//var engine = require('./expand_modules/ejs/index');
var app = express();
//var routes = require('./routes/index');

//app.engine('ejs',engine);
// view engine setup

app.set('port', process.env.PORT || 3030);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());//bodyParser解析客户端请求
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));//解析文件:请求
app.use(partials());//括号不能少

//配置session
app.use(session({
    secret: config.cookieSecret,
    resave: true,
    saveUninitialized: true,

}));

//网站信息寄存器
app.use(flash());

app.use(function(req,res,next){
    /*res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();*/
    res.locals.user=req.session.user;

    var err = req.flash('error');
    var success = req.flash('success');

    res.locals.error = err.length ? err : null;
    res.locals.success = success.length ? success : null;

    next();
});


app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

/*/!*路由规划*!/
app.use('/',routes);//主页
app.use('/u/:user',routes);//用户主页
app.use('/post',routes);//发表信息
app.use('/reg',routes);//用户注册
app.use('/doReg',routes);
app.use('/login',routes);//用户登录
app.use('/doLogin',routes);
app.use('/logout',routes);//用户退出*/


http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});


module.exports = app;
