const express = require("express");
const app = express();
const GetUserByUserName = require('./data/users.js').GetUserByUserName;
const GetUserById = require('./data/users.js').GetUserById;
const InsertArticle = require('./data/article.js').InsertArticle;
const GetAllArticles = require('./data/article.js').GetAllArticles;
const GetArticleById = require('./data/article.js').GetArticleById;
const GetArticleByStarId = require('./data/article.js').GetArticleByStarId;
const SearchArticles = require('./data/article.js').SearchArticles;
const GetStars = require('./data/users.js').GetStars;
const GetCompanies = require('./data/users.js').GetCompanies;
const moment = require("moment");

app.set('view engine', 'ejs');
app.set('views', __dirname+ '/views')
app.use(express.static('public'))

app.use(require("express-session")({
    secret:"thisisthemostsafetysecretever",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(require("cookie-parser")("thisisthemostsafetysecretever"));

let passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

let localStrategy = require("passport-local");
passport.use(new localStrategy(function(username, password, done) {
    return GetUserByUserName(username)
    .then(user =>{
        if(user && user.password == password) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    })
}))

passport.serializeUser(function(user, done) {
    return GetUserById(user._id).then(user => {
        if(user) {
            done(null, user._id);
        }
        else {
            done(new Error("Cant serialize this user"))
        }
    }).catch(err => done(new Error("Cant serialize this user")))
})

passport.deserializeUser(function(userId, done) {
    return GetUserById(userId).then(user => {
        if(user) {
            done(null, user);
        }
        else {
            done(new Error("Cant deserialize this user"));
        }
    })
})

let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use((req,res,next)=>{
    return next()
})

app.get('/', (req, res) => {
    let user = req.user;
    GetAllArticles().then(articles =>{
        res.render('homepage', {user, articles})
    })
})

app.get('/login', (req, res) => {
    let user = req.user;
    res.render('login', {user})
})

function CheckUser(req, res, next) {
    if(req.isAuthenticated()){
        next();
    }
    else {
        res.redirect("/login")
    }
}

app.post('/article', (req, res) => {
    if(!req.isAuthenticated()){
        res.sendStatus(403);
        return;
    }
    let article = req.body.article;
    article._datetime = new Date();
    article.id = req.user._id;
    article.type = req.user.type;
    return InsertArticle(article).then(result => {
        if(result.result.n){
            res.render('articles/articlepromo',{article:result.ops[0]})
            // res.send(result.ops[0])
        }
        else {
            res.res.sendStatus(500)
        }
    }).catch(err => {
        console.log(err)
        res.res.sendStatus(500)
    })
})

app.get('/article/:id', (req, res) => {
    let articleId = req.params.id;
    let user = req.user;
    return GetArticleById(articleId)
    .then(article => {
        res.render('articles/article', {article,user});
    })
})

app.post("/login", passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect:"/login"
}))

app.get('/stars',(req,res) =>{
    GetStars().then(stars=>{res.render('stars',{stars,user:req.user,moment})})
})

app.get('/star/:id',(req,res) =>{
    let starId = req.params.id;
    console.log(starId)
    GetArticleByStarId(starId).then(articles=>{
        console.log('articles.length: '+articles.length)
        res.render('homepage',{articles,user:req.user})
    })
})

app.get('/companies',(req,res) =>{
    GetCompanies().then(companies=>{res.render('stars',{stars:companies,user:req.user, moment})})
})

app.get('/search',(req, res) => {
    let {input, hubs} = req.query
    hubs = hubs == '' ? [] : hubs.split(',');
    SearchArticles(input, hubs).then(articles => {
        console.log('got '+articles.length+' articles')
        res.render('homepage' ,{user:req.user, articles})
    })
})

app.get('/about', (req, res) => {
    res.render('readme',{user:req.user})
})

app.listen(3000, (err,b) => {
});