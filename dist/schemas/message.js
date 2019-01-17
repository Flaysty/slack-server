'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _apolloServerExpress = require('apollo-server-express');

exports.default = _apolloServerExpress.gql`
  type Message {
    id: Int!
    text: String!
    user: User!
    channel: Channel!
    created_at: String!
  }
  type Subscription {
    newChannelMessage(channelId: Int!): Message!
  }
  type Query {
    messages(channelId: Int!): [Message!]!
  }
  type Mutation {
    createMessage(channelId: Int!, text: String!): Boolean!
  }
`;