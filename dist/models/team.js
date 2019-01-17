'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = (sequelize, DataTypes) => {
  const Team = sequelize.define('teams', {
    name: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Данное имя команды уже используется'
      }
    }
  });

  Team.associate = models => {
    Team.belongsToMany(models.User, {
      through: models.Member,
      foreignKey: {
        name: 'teamId',
        field: 'team_id'
      }
    });
  };

  return Team;
};