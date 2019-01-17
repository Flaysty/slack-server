'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphqlSubscriptions = require('graphql-subscriptions');

var _permissions = require('../permissions');

var _pubsub = require('../pubsub');

var _pubsub2 = _interopRequireDefault(_pubsub);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';

exports.default = {
  Subscription: {
    newChannelMessage: {
      subscribe: _permissions.requiresTeamAccess.createResolver((0, _graphqlSubscriptions.withFilter)(() => _pubsub2.default.asyncIterator(NEW_CHANNEL_MESSAGE), (payload, args) => payload.channelId === args.channelId))
    }
  },
  Message: {
    user: ({ user, userId }, args, { models }) => {
      if (user) {
        return user;
      }

      return models.User.findOne({ where: { id: userId } }, { raw: true });
    }
  },
  Query: {
    messages: _permissions.requiresAuth.createResolver(async (parent, { channelId }, { models }) => models.Message.findAll({ order: [['created_at', 'DESC']], where: { channelId }, limit: 35 }, { raw: true }))
  },
  Mutation: {
    createMessage: _permissions.requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const message = await models.Message.create(Object.assign({}, args, {
          userId: user.id
        }));

        const asyncFunc = async () => {
          const currentUser = await models.User.findOne({
            where: {
              id: user.id
            }
          });

          _pubsub2.default.publish(NEW_CHANNEL_MESSAGE, {
            channelId: args.channelId,
            newChannelMessage: Object.assign({}, message.dataValues, {
              user: currentUser.dataValues
            })
          });
        };

        asyncFunc();

        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    })
  }
};