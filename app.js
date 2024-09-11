const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const app = express();
const static = express.static(__dirname + "/public");
const configRoutes = require("./routes");
const exphbs = require("express-handlebars");
const handlebars = require("handlebars");
const cookieParser = require('cookie-parser');

app.use("/public", static);

const handlebarsInstance = exphbs.create({
    defaultLayout: "main",
});
//from lecture 9 code 
const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    // If the user posts to the server with a property called _method, rewrite the request's method
    // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
    // rewritten in this middleware to a PUT route
    if (req.body && req.body._method) {
      req.method = req.body._method;
      delete req.body._method;
    }
    // let the next middleware run:
    next();
  };
  


app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(rewriteUnsupportedBrowserMethods);
app.use(session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: true,
}));

app.engine("handlebars", handlebarsInstance.engine);
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
  });