'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _formatErrors = require('../formatErrors');

var _formatErrors2 = _interopRequireDefault(_formatErrors);

var _permissions = require('../permissions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Mutation: {
    createChannel: _permissions.requiresAuth.createResolver(async (parent, { teamId, name }, { models, user }) => {
      try {
        const member = await models.Member.findOne({ where: { teamId, userId: user.id } }, { raw: true });
        if (!member.admin) {
          return {
            ok: false,
            errors: [{
              path: 'name',
              message: 'Вы должны быть владельцем группы, чтобы создать новый канал'
            }]
          };
        }
        const channel = await models.Channel.create({ name, public: true, teamId });
        return {
          ok: true,
          channel
        };
      } catch (e) {
        return {
          ok: false,
          errors: (0, _formatErrors2.default)(e)
        };
      }
    })
  }
};