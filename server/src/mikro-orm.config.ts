import { MikroORM } from '@mikro-orm/core'
import { __prod__ } from './constants'
import { Post } from './entities/Post'
import { join } from 'path'

export default {
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    user: 'admin',
    password: 'admin',
    dbName: 'lireddit-postgres',
    debug: !__prod__,
    entities: [
        Post
    ],
    migrations: {
        path: join(__dirname, './migrations'), // path to the folder with migrations
        pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
    }
} as Parameters<typeof MikroORM.init>[0]