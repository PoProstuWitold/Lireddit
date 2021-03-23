import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core' //ctrl + space for autocompletion
import { COOKIE_NAME, __prod__ } from './constants'
import microConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { MyContext } from './types'
import cors from 'cors'

const main = async () => {
    const orm = await MikroORM.init(microConfig)
    await orm.getMigrator().up()

    const RedisStore = connectRedis(session)
    const redis = new Redis()

    const app = express()

    app.use(
        cors({
            origin: 'http://localhost:3000',
            credentials: true
        })
    )

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ 
                client: redis,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000*60*60*24*365*5, // 5 years
                httpOnly: true,
                sameSite: 'lax', // csrf
                secure: __prod__ // only works at https while in production mode
            },
            saveUninitialized: false, // save session even if it is empty if set to true
            secret: 'ciaowhd8usaghdiwauin',
            resave: false,
        })
    )
    
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                HelloResolver,
                PostResolver,
                UserResolver
            ],
            validate: false
        }),
        context: ({ req, res }): MyContext => ({ em: orm.em, req, res, redis }) //special object that is accesibble from all your resolvers
    })

    apolloServer.applyMiddleware({
        app,
        cors: false
    })

    app.listen(4000, () => {
        console.log(`Server started listening at port 4000. GLHF!`)
    })
}

main().catch(err => {
    console.error(err)
})