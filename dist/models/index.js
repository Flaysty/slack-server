'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

exports.default = async () => {
  let connected = false;
  let maxReconnects = 20;
  const sequelize = new _sequelize2.default(process.env.TEST_DB || 'slack', 'flaysty', '', {
    dialect: 'postgres',
    operatorsAliases: _sequelize2.default.Op,
    host: process.env.DB_HOST || 'localhost',
    define: {
      underscored: true
    }
  });

  while (!connected && maxReconnects) {
    try {
      // eslint-disable-next-line
      await sequelize.authenticate();
      connected = true;
    } catch (e) {
      console.log('Reconnection to db in 5 seconds');
      // eslint-disable-next-line
      await sleep(5000);
      maxReconnects -= 1;
    }
  }

  if (!connected) {
    return null;
  }

  const models = {
    User: sequelize.import('./user'),
    Channel: sequelize.import('./channel'),
    Message: sequelize.import('./message'),
    Team: sequelize.import('./team'),
    Member: sequelize.import('./member'),
    DirectMessage: sequelize.import('./directMessage')
  };

  Object.keys(models).forEach(modelName => {
    if ('associate' in models[modelName]) {
      models[modelName].associate(models);
    }
  });

  models.sequelize = sequelize;
  models.Sequelize = _sequelize2.default;

  return models;
};