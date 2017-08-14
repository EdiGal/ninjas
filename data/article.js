const articles = require("mongoskin").db('mongodb://localhost:27017/Stars',{w:1}).collection('Articles');
const toObjectID = require("mongoskin").helper.toObjectID;

exports.InsertArticle = Article => new Promise((resolve, reject) => {
    articles.insert(Article,  (err, result) => {
        if (err)
            reject(err);
        else {
            resolve(result);
        }
    });
})

exports.GetAllArticles = () => new Promise((resolve, reject) => {
    articles.find().sort({_datetime: -1}).toArray((err, result) => {
        if (err)
            reject(err);
        else {
            resolve(result);
        }
    });
})

exports.GetArticleById = id => new Promise((resolve, reject) => {
    id = toObjectID(id);
    articles.findById(id, (err, result) => {
        if (err)
            reject(err);
        else {
            resolve(result);
        }
    });
})

exports.SearchArticles = (content, hubs) => new Promise((resolve, reject) => {
    let condition = {
        $or:[{Title:{$regex:'.*'+content+'.*'}},{Title:{$regex:'.*'+content+'.*'}},{Content:'.*'+content+'.*'},{PromoContent:{$regex:'.*'+content+'.*'}}]
    }
    if(hubs.length>0){
        condition.hubs={$in:hubs}
    }

    articles.find(condition).toArray((err, articles) => {
        if (err)
            reject(err);
        else {
            resolve(articles);
        }
    });
})

exports.GetArticleByStarId = id => new Promise((resolve, reject) => {
    id = toObjectID(id);
    articles.find({id}).toArray((err, result) => {
        if (err)
            reject(err);
        else {
            resolve(result);
        }
    });
})
