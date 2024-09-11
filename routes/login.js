const express = require("express");
const bcrypt = require('bcryptjs');
const router = express.Router();
const users = require("../data/users");

router.get("/", (req,res) =>{
    if(req.session.user) {
        logFunc(true, req);
        res.redirect("/private");
    } else {
        logFunc(false, req);
        res.render("layouts/login", { title: "Login Page", status: false});
    }
    return;
});

router.post("/login", async (req, res) => {
    //get the username and password from the form
    let username = req.body.username;
    let password = req.body.password;
    logFunc(false, req);
    //if username and password is empty then display error message 
    if(!username) {
        res.render("layouts/login", {title: "Error", message: "missing username", status: false});
        return;
    }
    if(!password) {
        res.render("layouts/login", {title: "Error", message: "missing password", status: false});
        return;
    }
    //if username and password are wrong display message 
    //otherwise set a cookie and go to /private
    try {
        if(!( await testGiven(password, username))) {
            //res.render("layouts/login", {title: "Wrong Info", message: "wrong username or password", status: false});
            res.status(401).render("layouts/login", {title: "Error", message: "wrong username or password"});

            return;
        } else {
            req.session.user = getData(username); 
            res.cookie("name","AuthCookie");
            res.redirect("/private");
            return;
        }
    } catch(e) {
        //dont do anything 
    }
});

router.get("/private", valid, async (req, res) =>{
    let user = req.session.user;
    if(user) {
        //get all the info on the user 
        logFunc(true, req);
        res.render("layouts/private", {title: "User Data", user});
    } else {
        logFunc(false, req);
        res.render("layouts/login", {title: "Login Page", status: false});
    }
});

//if they logout then destroy the session and go back to the login page
router.get("/logout", async (req, res) =>{
    logFunc(true, req);
    req.session.user = null;
    req.session.destroy();
    res.render("layouts/login", {title: "Logout Page", message: "You are now logged out"});
    return;
});

//get the users information that is stored in users.js
function getData(name) { 
    for(let i = 0; i < users.length; i++){
        if(users[i].username == name){
            return users[i];
        }
    }
}

async function testGiven(pass, name) {  
    for(let i = 0; i< users.length; i++) {
        //compare the given password with the stored hashed password and the usernames match 
        if(await bcrypt.compare(pass, users[i].hashedPassword) && (name == users[i].username)){
            console.log("username and password are good");
            return true;
        }
    }
    return false;
}

function logFunc(val, req){
    //get the time stamp
    let str = new Date().toUTCString() + " " + req.method + " " + req.originalUrl;
    if(val){
        str = str +  " (Authenticated User)";
    }else{
        str = str +  " (Non-Authenticated User)";
    }
    console.log(str);
    return;
}

function valid(req, res, next) {
    if(req.session.user) {
        logFunc(true, req);
        next();
    }else{
        logFunc(false, req);
        res.status(403).render("layouts/error", {title: "Not Authenticated", message: "user has to log in"});
    }
}

module.exports = router;