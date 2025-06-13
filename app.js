const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const viewRoutes = require('./routes/viewRoutes');

//import post router
const postRouter = require('./routes/post.route');
const userRouter = require('./routes/user.route')

const app = express()

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

//add middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.use("/api", userRouter)
app.use("/api/posts", postRouter)
app.use('/', viewRoutes);

module.exports = app;