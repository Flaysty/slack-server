import formatErrors from '../formatErrors';
import { requiresAuth } from '../permissions';

export default {
  Mutation: {
    createChannel: requiresAuth.createResolver(
      async (parent, { teamId, name }, { models, user }) => {
        try {
          const member = await models.Member.findOne(
            { where: { teamId, userId: user.id } }, { raw: true },
          );
          if (!member.admin) {
            return {
              ok: false,
              errors: [
                {
                  path: 'name',
                  message: 'Вы должны быть владельцем группы, чтобы создать новый канал',
                },
              ],
            };
          }
          const channel = await models.Channel.create({ name, public: true, teamId });
          return {
            ok: true,
            channel,
          };
        } catch (e) {
          return {
            ok: false,
            errors: formatErrors(e),
          };
        }
      },
    ),
  },
};
