'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _apolloServerExpress = require('apollo-server-express');

exports.default = _apolloServerExpress.gql`
  type Channel {
    id: Int!
    name: String!
    public: Boolean!
    messages: [Message!]!
    users: [User!]!
  }

  type ChannelResponse {
    ok: Boolean!
    channel: Channel
    errors: [Error!]
  }

  type Mutation {
    createChannel(teamId: Int!, name: String!, public: Boolean=false): ChannelResponse!
  }
`;