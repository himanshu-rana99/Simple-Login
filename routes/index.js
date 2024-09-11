const userRoutes = require("./login");

const constructorMethod = app => {
    app.use("/", userRoutes);

    //if the user types anything else just go to /
    app.use("*", (req, res) => {
        res.redirect("/");
    });
};

module.exports = constructorMethod;