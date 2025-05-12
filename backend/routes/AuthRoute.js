import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  (req, res) => {
    const user = encodeURIComponent(JSON.stringify(req.user));
    res.redirect(`http://localhost:3000/dashboard?user=${user}`);
  }
);

export default router;
