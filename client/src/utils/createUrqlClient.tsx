import { dedupExchange, fetchExchange, Exchange } from 'urql'
import { cacheExchange, Cache } from '@urql/exchange-graphcache'
import { ChangePasswordMutation, LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql'
import { betterUpdateQuery } from './betterUpdateQuery'
import { pipe, tap } from 'wonka'
import Router from 'next/router'

const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("not authenticated") || error?.message.includes("Not authenticated")) {
        Router.replace("/login")
      }
    })
  );
};

function invalidateAllPosts(cache: Cache) {
  const allFields = cache.inspectFields('Query')
  console.log('allFields: ', allFields)
  const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
  console.log('fieldInfos: ', fieldInfos)
  fieldInfos.forEach((fi) => {
    console.log('fi', fi)
    cache.invalidate("Query", "posts");
  });
}

export const createUrqlClient = (ssrExchange: any ) => ({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const
    },
    exchanges: [
      dedupExchange, 
      cacheExchange({
        updates: {
          Mutation: {
            login: (_result, args, cache, info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache, 
                { query: MeDocument },
                _result,
                (result, query) => {
                  if(result.login.errors) {
                    return query
                  } else {
                    return {
                      me: result.login.user
                    }
                  }
                }
              )
            },
            register: (_result, args, cache, info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache, 
                { query: MeDocument },
                _result,
                (result, query) => {
                  if(result.register.errors) {
                    return query
                  } else {
                    return {
                      me: result.register.user
                    }
                  }
                }
              )
            },
            logout: (_result, args, cache, info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              )
            },
            changePassword: (_result, args, cache, info) => {
              betterUpdateQuery<ChangePasswordMutation, MeQuery>(
                cache, 
                { query: MeDocument },
                _result,
                (result, query) => {
                  if(result.changePassword.errors) {
                    return query
                  } else {
                    return {
                      me: result.changePassword.user
                    }
                  }
                }
              )
            },
            createPost: (_result, args, cache, info) => {
              invalidateAllPosts(cache)
            },
          }
        },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
})