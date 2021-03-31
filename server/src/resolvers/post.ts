import { isAuth } from '../middlewares/isAuth'
import { MyContext } from '../types'
import { Arg, Mutation, Query, Resolver, Field, InputType, Ctx, UseMiddleware, ObjectType, Int, FieldResolver, Root } from 'type-graphql'
import { Post } from '../entities/Post'
import insertedDataHandler from '../utils/insertedDataHandler'
import { postSchema } from '../utils/validation'
import { FieldError } from './user'
import { getConnection } from 'typeorm'
// QUERY - getting
// MUTATION - updating, deleting

@InputType()
class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
}


@ObjectType()
class PostResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => Post, { nullable: true })
    post?: Post
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[]

    @Field()
    hasMore: boolean
}

@Resolver(Post)
export class PostResolver {

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const { userId } = req.session
        const isUpdoot = value !== -1
        const realValue = isUpdoot ? 1 : -1

        await getConnection().query(
            `
            START TRANSACTION;

            INSERT INTO updoot ("userId", "postId", value)
            VALUES (${userId},${postId},${realValue});

            UPDATE post
            SET points = points + ${realValue}
            WHERE id = ${postId};

            COMMIT;

            `
        )

        return true
    }

    @FieldResolver(() => String)
    textSnippet(
        @Root() post: Post
    ) {
        return `${post.text.slice(0, 50)}...`
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedPosts> {

        const realLimit = Math.min(50, limit)
        const realLimitPlusOne = realLimit + 1

        const replacements: any[] = [
            realLimitPlusOne
        ]

        if(cursor) {
            replacements.push(new Date(parseInt(cursor)))
        }

        const posts = await getConnection().query(
            `
            SELECT p.*, 
            JSON_BUILD_OBJECT(
                'id', u.id,
                'username', u.username,
                'email', u.email,
                'createdAt', u."createdAt",
                'updatedAt', u."updatedAt"
            ) creator
            from post p
            inner join public.user u on u.id = p."creatorId"
            ${cursor ? `where p."createdAt" < $2` : ""}
            order by p."createdAt" DESC
            limit $1
            `,
            replacements
        )

        // const qb = getConnection()
        //     .getRepository(Post)
        //     .createQueryBuilder("p") // alias
        //     .orderBy('p."created_at"', 'DESC')
        //     .take(realLimitPlusOne)
        // if(cursor) {
        //     qb.where('p."created_at" < :cursor', { 
        //             cursor: new Date(parseInt(cursor)) 
        //         })
        // }

        // const posts = await qb.getMany()
        // console.log('posts', posts[0])

        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne
        }
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg('id') id: number
    ): Promise<Post | undefined> {
        return Post.findOne(id)
    }

    @Mutation(() => PostResponse)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<PostResponse> {

        const errors = insertedDataHandler(postSchema, input)

        if(errors) {
            return { errors }
        }

        const post = Post.create({
            ...input,
            creatorId: req.session.userId,
        })

        
        try {
            await post.save()
        } catch (err) {
            console.log(err)
            return {
                errors: [
                    {
                        field: "title",
                        message: "Something went wrong. Please, try again",
                    },
                    {
                        field: "text",
                        message: "Something went wrong. Please, try again",
                    }
                ]
            }
        }

        return { post }
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, { nullable: true }) title: string
    ): Promise<Post | null> {
        const post = await Post.findOne(id)

        if(!post) {
            return null
        }

        if(typeof title !== 'undefined') {
            await Post.update({ id }, { title })
        }

        return post
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number
    ): Promise<boolean> {
        await Post.delete(id)
        return true
    }
}