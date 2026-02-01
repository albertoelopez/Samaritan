import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { config } from './environment';
import { db } from './database';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// JWT Strategy
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.secret,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: JwtPayload, done) => {
    try {
      const user = await db('users')
        .where({ id: payload.sub, status: 'active' })
        .whereNull('deleted_at')
        .first();

      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google OAuth Strategy
if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.oauth.google.clientId,
        clientSecret: config.oauth.google.clientSecret,
        callbackURL: config.oauth.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email provided by Google'), undefined);
          }

          let user = await db('users').where({ email }).first();

          if (!user) {
            // Create new user
            [user] = await db('users')
              .insert({
                email,
                first_name: profile.name?.givenName || 'User',
                last_name: profile.name?.familyName || '',
                profile_picture_url: profile.photos?.[0]?.value,
                role: 'worker', // Default role, can be changed later
                status: 'active',
                email_verified: true,
                password_hash: '', // OAuth users don't have passwords
              })
              .returning('*');
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Facebook OAuth Strategy
if (config.oauth.facebook.clientId && config.oauth.facebook.clientSecret) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.oauth.facebook.clientId,
        clientSecret: config.oauth.facebook.clientSecret,
        callbackURL: config.oauth.facebook.callbackUrl,
        profileFields: ['id', 'emails', 'name', 'picture'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email provided by Facebook'), undefined);
          }

          let user = await db('users').where({ email }).first();

          if (!user) {
            [user] = await db('users')
              .insert({
                email,
                first_name: profile.name?.givenName || 'User',
                last_name: profile.name?.familyName || '',
                profile_picture_url: profile.photos?.[0]?.value,
                role: 'worker',
                status: 'active',
                email_verified: true,
                password_hash: '',
              })
              .returning('*');
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;
