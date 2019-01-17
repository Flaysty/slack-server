import axios from 'axios';

describe('user resolvers', () => {
  test('allUsers', async () => {
    const response = await axios.post('http://localhost:8080/graphql', {
      query: `
        query {
          allUsers {
            id
            username
            email
          }
        }
      `,
    });
    const { data } = response;
    expect(data).toMatchObject({
      data: {
        allUsers: [],
      },
    });
  });

  test('register', async () => {
    const response = await axios.post('http://localhost:8080/graphql', {
      query: `
        mutation {
          register(username: "testuser", email: "testuser@email.com", password: "tester") {
            ok
            errors {
              path
              message
            }
            user {
              username
              email
            }
          }
        }
      `,
    });
    const { data } = response;
    expect(data).toMatchObject({
      data: {
        register: {
          ok: true,
          errors: null,
          user: {
            username: 'testuser',
            email: 'testuser@email.com',
          },
        },
      },
    });
  });

  test('create team', async () => {
    const response = await axios.post('http://localhost:8080/graphql', {
      query: `
        mutation {
          login(email: "testuser@email.com", password: "tester") {
            token
            refreshToken
          }
        }
      `,
    });
    const { data: { login: { token, refreshToken } } } = response.data;
    const response2 = await axios.post('http://localhost:8080/graphql', {
      query: `
        mutation {
          createTeam(name: "team 1") {
            ok
            team {
              name
            }
          }
        }
      `,
    }, {
      headers: {
        'x-token': token,
        'x-refresh-token': refreshToken,
      },
    });
    expect(response2.data).toMatchObject({
      data: {
        createTeam: {
          ok: true,
          team: {
            name: 'team 1',
          },
        },
      },
    });
  });
});
