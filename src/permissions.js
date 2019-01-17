const createResolver = (resolver) => {
  const baseResolver = resolver;
  baseResolver.createResolver = (childResolver) => {
    const newResolver = async (parent, args, context, info) => {
      await resolver(parent, args, context, info);
      return childResolver(parent, args, context, info);
    };
    return createResolver(newResolver);
  };
  return baseResolver;
};
// eslint-disable-next-line
export const requiresAuth = createResolver((parent, args, { user }) => {
  if (!user || !user.id) {
    throw new Error('Не авторизован');
  }
});
// eslint-disable-next-line
export const requiresTeamAccess = createResolver(async (parent, { channelId }, { user, models }) => {
  if (!user || !user.id) {
    throw new Error('Не авторизован');
  }
  // part of team?
  const channel = await models.Channel.findOne({ where: { id: channelId } });
  const member = await models.Member.findOne({
    where: { teamId: channel.id, userId: user.id },
  });
  if (!member) {
    throw new Error('Вы должны быть учатником группы, чтобы начать получать сообщения');
  }
});
// eslint-disable-next-line
export const directMessageSubscription = createResolver(async (parent, { teamId, userId }, { user, models }) => {
  if (!user || !user.id) {
    throw new Error('Не авторизован');
  }
  const members = await models.Member.findAll({
    where: {
      teamId,
      [models.sequelize.Op.or]: [{ userId }, { userId: user.id }],
    },
  });
  if (!members) {
    throw new Error('Вы должны быть учатником переписки, чтобы начать получать сообщения');
  }
});
