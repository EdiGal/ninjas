const users = require("mongoskin").db('mongodb://localhost:27017/Stars',{w:1}).collection('Users');

exports.GetUserById = id => new Promise((resolve, reject) => {
    users.findById(id,  (err, user) => {
        if (err)
            reject(err);
        else {
            resolve(user);
        }
    });
})

exports.GetUserByUserName = userName => new Promise((resolve, reject) => {
    users.findOne({userName:userName}, function (err, user) {
        if (err)
            reject(err);
        else {
            resolve(user);
        }
    });
})

exports.GetStars = () => new Promise((resolve, reject) => {
    users.find({type:'user'}).toArray(function (err, user) {
        if (err)
            reject(err);
        else {
            resolve(user);
        }
    });
})

exports.GetCompanies = () => new Promise((resolve, reject) => {
    users.find({type:'company'}).toArray(function (err, user) {
        if (err)
            reject(err);
        else {
            resolve(user);
        }
    });
})