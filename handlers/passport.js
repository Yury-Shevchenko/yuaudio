const passport = require('passport');
const mongoose = require('mongoose');

const User = mongoose.model('user');
const validator = require('validator');

const Project = mongoose.model('project');

const LocalStrategy = require('passport-local').Strategy;

// id -> cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// cookie -> id
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

// local strategy with email
passport.use(
  'local-signup',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true, // allows us to pass back the entire request to the callback
    },
    async function(req, email, password, done) {
      console.log('trying passport', req.body);
      const normEmail = validator.normalizeEmail(email);
      console.log('normEmail', normEmail);
      process.nextTick(function() {
        User.findOne({ email: normEmail }, async function(err, user) {
          if (req.body.password !== req.body.confirmPassword) {
            return done(null, false);
          }
          if (err) return done(err);
          if (user) {
            if (!user.validPassword(password)) return done(null, false);
            return done(null, user);
          }
          const newUser = new User();
          newUser.name = req.body.name;
          newUser.email = normEmail;
          newUser.password = newUser.generateHash(password);
          if (req.body.study) {
            const project = await Project.findOneAndUpdate(
              { _id: req.body.study },
              {
                $addToSet: {
                  users: newUser.id,
                },
              },
              { new: true }
            );
            if (project && project._id) {
              newUser.studies = [project._id];
              newUser.level = 1;
            }
          } else {
            newUser.level = 11;
          }
          newUser.save(function(err) {
            if (err) throw err;
            return done(null, newUser);
          });
        });
      });
    }
  )
);

passport.use(
  'local-login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    function(req, email, password, done) {
      const normEmail = validator.normalizeEmail(email);
      User.findOne({ email: normEmail }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false);
        if (!user.validPassword(password)) return done(null, false);
        return done(null, user);
      });
    }
  )
);
