var mongodb = require('./db');

/*
构造函数
 */
function Post(username,post,time) {
    this.username = username;
    this.post = post;
    //如果时间为空则设置为当前时间
    if(time){
        this.time = time;
    }else{
        this.time = new Date();
    }

};
module.exports = Post;
/**
 * 保存操作
 * @param callback
 */
Post.prototype.save = function save(callback) {
    //存入文档
    var post ={
        user:this.user,
        post:this.post,
        time:this.time,
    };
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //添加索引
            collection.ensureIndex('user');
            //写入post文档
            collection.insert(post,{safe:true},function (err,post) {
                mongodb.close();
                callback(err,post);
            });
        });
    });
};
//读取指定用户下的微博信息
Post.get = function get(username,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查找user属性为username的文档，如果为null则全部匹配
            var query={};
            if(username){
                query.user=username;
            }
            //查找user属性为username的文档，如果username是null则匹配全部
            collection.find(query).sort({time:-1}).toArray(function (err,docs) {
                mongodb.close();
                if(err){
                    callback(err,null);
                }
                //封装posts为Posts对象
                var posts = [];
                docs.forEach(function (doc,index) {
                    var post = new Post(doc.user,doc.post,doc.time);
                    posts.push(post);
                });
                callback(null,posts);
            });
        });
    });
};