'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const createResolver = resolver => {
  const baseResolver = resolver;
  baseResolver.createResolver = childResolver => {
    const newResolver = async (parent, args, context, info) => {
      await resolver(parent, args, context, info);
      return childResolver(parent, args, context, info);
    };
    return createResolver(newResolver);
  };
  return baseResolver;
};
// eslint-disable-next-line
const requiresAuth = exports.requiresAuth = createResolver((parent, args, { user }) => {
  if (!user || !user.id) {
    throw new Error('Не авторизован');
  }
});
// eslint-disable-next-line
const requiresTeamAccess = exports.requiresTeamAccess = createResolver(async (parent, { channelId }, { user, models }) => {
  if (!user || !user.id) {
    throw new Error('Не авторизован');
  }
  // part of team?
  const channel = await models.Channel.findOne({ where: { id: channelId } });
  const member = await models.Member.findOne({
    where: { teamId: channel.id, userId: user.id }
  });
  if (!member) {
    throw new Error('Вы должны быть учатником группы, чтобы начать получать сообщения');
  }
});
// eslint-disable-next-line
const directMessageSubscription = exports.directMessageSubscription = createResolver(async (parent, { teamId, userId }, { user, models }) => {
  if (!user || !user.id) {
    throw new Error('Не авторизован');
  }
  const members = await models.Member.findAll({
    where: {
      teamId,
      [models.sequelize.Op.or]: [{ userId }, { userId: user.id }]
    }
  });
  if (!members) {
    throw new Error('Вы должны быть учатником переписки, чтобы начать получать сообщения');
  }
});