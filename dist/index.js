'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _apolloServerExpress = require('apollo-server-express');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mergeGraphqlSchemas = require('merge-graphql-schemas');

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _graphqlTools = require('graphql-tools');

var _auth = require('./auth');

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SECRET = 'hfgtyewby83rfbueyg63f7378f';
const SECRET2 = 'sdfjgdhgouhgu34hg734hg934hfh34gh34';

const typeDefs = (0, _mergeGraphqlSchemas.mergeTypes)((0, _mergeGraphqlSchemas.fileLoader)(_path2.default.join(__dirname, './schemas')));
const resolvers = (0, _mergeGraphqlSchemas.mergeResolvers)((0, _mergeGraphqlSchemas.fileLoader)(_path2.default.join(__dirname, './resolvers')));

(0, _models2.default)().then(models => {
  if (!models) {
    console.log('Could not connect to database');
    return;
  }

  const app = (0, _express2.default)();
  app.use((0, _cors2.default)('*'));

  const addUser = async (req, res, next) => {
    const token = req.headers['x-token'];
    if (token) {
      try {
        const { user } = _jsonwebtoken2.default.verify(token, SECRET);
        req.user = user;
      } catch (err) {
        const refreshToken = req.headers['x-refresh-token'];
        const newTokens = await (0, _auth.refreshTokens)(token, refreshToken, models, SECRET, SECRET2);
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

  const schema = (0, _graphqlTools.makeExecutableSchema)({
    typeDefs,
    resolvers
  });

  const server = new _apolloServerExpress.ApolloServer({
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
        SECRET2
      };
    },
    subscriptions: {
      onConnect: async ({ token, refreshToken }) => {
        if (token && refreshToken) {
          try {
            const { user } = _jsonwebtoken2.default.verify(token, SECRET);
            return { models, user };
          } catch (err) {
            const newTokens = await (0, _auth.refreshTokens)(token, refreshToken, models, SECRET, SECRET2);
            return { models, user: newTokens.user };
          }
        }
        return { models };
      }
    }
  });
  server.applyMiddleware({ app });

  const httpServer = _http2.default.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  models.sequelize.sync({}).then(() => {
    httpServer.listen(8080, err => {
      if (err) throw err;
      // eslint-disable-next-line no-console
      console.log('Server listening on port 8080');
    });
  });
});