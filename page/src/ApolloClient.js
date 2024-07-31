import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { REFRESH_TOKEN } from './graphql';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions.code === 'UNAUTHENTICATED') {
        const refreshToken = localStorage.getItem('refreshToken');
        return client.mutate({
          mutation: REFRESH_TOKEN,
          variables: { refreshToken },
        }).then(({ data }) => {
          localStorage.setItem('accessToken', data.refreshToken.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken.refreshToken);
          // Retry the failed request with the new access token
          const newHeaders = {
            ...operation.getContext().headers,
            authorization: `Bearer ${data.refreshToken.accessToken}`,
          };
          return forward(operation.setContext({ headers: newHeaders }));
        }).catch(() => {
          // Handle token refresh errors (e.g., logout)
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.reload();
        });
      }
    }
  }
  if (networkError) {
    console.error(`Network error: ${networkError.message}`);
  }
  return forward(operation);
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache(),
});

export default client;
