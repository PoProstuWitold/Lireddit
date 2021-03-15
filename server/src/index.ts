import { MikroORM } from '@mikro-orm/core' //ctrl + space for autocompletion
import { __prod__ } from './constants'
import { Post } from './entities/Post'
import microConfig from './mikro-orm.config'

const main = async () => {
    const orm = await MikroORM.init(microConfig)
    await orm.getMigrator().up()
    // const post = orm.em.create(Post, {title: 'post title'}) // === new Post('post title')
    // await orm.em.persistAndFlush(post)

    // const posts = await orm.em.find(Post, {});
    // console.log(posts);
}

main().catch(err => {
    console.error(err)
})