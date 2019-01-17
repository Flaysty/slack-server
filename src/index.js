import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import http from 'http';
import { makeExecutableSchema } from 'graphql-tools';
import { refreshTokens } from './auth';
import getModels from './models';

const SECRET = 'hfgtyewby83rfbueyg63f7378f';
const SECRET2 = 'sdfjgdhgouhgu34hg734hg934hfh34gh34';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schemas')));
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));


getModels().then((models) => {
  if (!models) {
    console.log('Could not connect to database');
    return;
  }

  const app = express();
  app.use(cors('*'));

  const addUser = async (req, res, next) => {
    const token = req.headers['x-token'];
    if (token) {
      try {
        const { user } = jwt.verify(token, SECRET);
        req.user = user;
      } catch (err) {
        const refreshToken = req.headers['x-refresh-token'];
        const newTokens = await refreshTokens(token, refreshToken, models, SECRET, SECRET2);
        if (newTokens.token && newTokens.refreshToken) {
          res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
          res.set('x-token', newTokens.token);
          res.set('x-refresh-token', newTokens.refreshToken);
        }
        req.user = newTokens.user;
      }
    }
    next();
  };

  app.use(addUser);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const server = new ApolloServer({
    schema,
    context: async ({ req, connection }) => {
      if (connection) {
        // check connection for metadata
        return connection.context;
      }
      return {
        models,
        user: req.user,
        SECRET,
        SECRET2,
      };
    },
    subscriptions: {
      onConnect: async ({ token, refreshToken }) => {
        if (token && refreshToken) {
          try {
            const { user } = jwt.verify(token, SECRET);
            return { models, user };
          } catch (err) {
            const newTokens = await refreshTokens(token, refreshToken, models, SECRET, SECRET2);
            return { models, user: newTokens.user };
          }
        }
        return { models };
      },
    },
  });
  server.applyMiddleware({ app });

  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  models.sequelize.sync({}).then(() => {
    httpServer.listen(8080, (err) => {
      if (err) throw err;
      // eslint-disable-next-line no-console
      console.log('Server listening on port 8080');
    });
  });
});
