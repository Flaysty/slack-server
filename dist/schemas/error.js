'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _apolloServerExpress = require('apollo-server-express');

exports.default = _apolloServerExpress.gql`
  type Error {
    path: String!
    message: String!
  }
`;