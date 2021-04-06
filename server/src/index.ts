import 'reflect-metadata'
import { COOKIE_NAME, __prod__ } from './constants'
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
import { createConnection } from 'typeorm'
import { Post } from './entities/Post'
import { User } from './entities/User'
//import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import path from 'path'
import { Updoot } from './entities/Updoot'
import { createUserLoader } from './utils/createUserLoader'
import { createUpdootLoader } from './utils/createUpdootLoader'


const main = async () => {
     const conn = await createConnection({
        type: 'postgres',
        database: 'lireddit-postgres',
        username: 'admin',
        password: 'admin',
        logging: true,
        synchronize: true,
        //namingStrategy: new SnakeNamingStrategy(),
        migrations: [
            path.join(__dirname, "./migrations/*")
        ],
        entities: [
            Post,
            User,
            Updoot
        ],
    })

    await conn.runMigrations()

    const RedisStore = connectRedis(session)
    const redis = new Redis()

    const app = express()

    app.set("trust proxy", 1)
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
        context: ({ req, res }): MyContext => ({ 
            req, 
            res, 
            redis, 
            userLoader: createUserLoader(), 
            updootLoader: createUpdootLoader()
        }) //special object that is accesibble from all your resolvers
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