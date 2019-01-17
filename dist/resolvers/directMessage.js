'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphqlSubscriptions = require('graphql-subscriptions');

var _permissions = require('../permissions');

var _pubsub = require('../pubsub');

var _pubsub2 = _interopRequireDefault(_pubsub);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NEW_DIRECT_MESSAGE = 'NEW_DIRECT_MESSAGE';

exports.default = {
  Subscription: {
    newDirectMessage: {
      subscribe: _permissions.directMessageSubscription.createResolver((0, _graphqlSubscriptions.withFilter)(() => _pubsub2.default.asyncIterator(NEW_DIRECT_MESSAGE), (payload, args, { user }) => payload.teamId === args.teamId && (payload.senderId === user.id && payload.receiverId === args.userId || payload.senderId === args.userId && payload.receiverId === user.id)))
    }
  },
  DirectMessage: {
    sender: ({ sender, senderId }, args, { models }) => {
      if (sender) {
        return sender;
      }

      return models.User.findOne({ where: { id: senderId } }, { raw: true });
    }
  },
  Query: {
    directMessages: _permissions.requiresAuth.createResolver(async (parent, { teamId, otherUserId }, { models, user }) => models.DirectMessage.findAll({
      order: [['created_at', 'ASC']],
      where: {
        teamId,
        [models.sequelize.Op.or]: [{
          [models.sequelize.Op.and]: [{ receiverId: otherUserId }, { senderId: user.id }]
        }, {
          [models.sequelize.Op.and]: [{ receiverId: user.id }, { senderId: otherUserId }]
        }]
      }
    }, { raw: true }))
  },
  Mutation: {
    createDirectMessage: _permissions.requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const directMessage = await models.DirectMessage.create(Object.assign({}, args, {
          senderId: user.id
        }));

        _pubsub2.default.publish(NEW_DIRECT_MESSAGE, {
          teamId: args.teamId,
          receiverId: args.receiverId,
          senderId: user.id,
          newDirectMessage: Object.assign({}, directMessage.dataValues, {
            sender: {
              username: user.username
            }
          })
        });
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    })
  }
};