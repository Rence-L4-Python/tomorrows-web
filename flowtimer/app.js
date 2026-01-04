const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const User = require('./models/user');
const auth = require('./middleware/auth');
require('dotenv').config();
require('./passport-config');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Code reference from Bart Read, https://stackoverflow.com/questions/16534545/how-to-get-rid-of-html-extension-when-serving-webpages-with-node-js
app.use(express.static(path.join(__dirname, 'public'), {
extensions: ['html', 'htm'] 
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/api/user', (req, res) => { 
    if (!req.isAuthenticated()) { 
        return res.json({ user: null }); 
    }
    res.json({ 
        email: req.user.email, 
        name: req.user.name 
    }); 
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Redirect check

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login.html');
}

// Redirect to files in the private folder
app.get('/flowtimer', isLoggedIn, (req, res) => { 
    res.sendFile(path.join(__dirname, 'private/flowtimer.html')); 
}); 
app.get('/metrics', isLoggedIn, (req, res) => { 
    res.sendFile(path.join(__dirname, 'private/metrics.html')); 
}); 
app.get('/settings', isLoggedIn, (req, res) => { 
    res.sendFile(path.join(__dirname, 'private/settings.html')); 
});

// Routes
const users = require('./routes/users');
app.use('/users', users);

// Google OAuth routes
app.get('/auth/google',
    passport.authenticate('google', {scope: ['profile', 'email']})
);

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/login.html'}),
    (req, res) => {
        res.redirect('/flowtimer');
    }
);

app.get('/logout', (req, res, next) => {
    req.logout(function(err){
        if (err) { return next(err); }
        req.session.destroy(() => {
            res.redirect('/login.html');
        })
    })
});

// Admin routes
app.use('/admin', auth, express.static(path.join(__dirname, 'private/admin')));

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        req.login(user, (err) =>{
            if (err) return next(err);
            return res.json({success:true});
        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});