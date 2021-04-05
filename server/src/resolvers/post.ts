import { isAuth } from '../middlewares/isAuth'
import { MyContext } from '../types'
import { Arg, Mutation, Query, Resolver, Field, InputType, Ctx, UseMiddleware, ObjectType, Int, FieldResolver, Root } from 'type-graphql'
import { Post } from '../entities/Post'
import insertedDataHandler from '../utils/insertedDataHandler'
import { postSchema } from '../utils/validation'
import { FieldError } from './user'
import { getConnection } from 'typeorm'
import { Updoot } from '../entities/Updoot'
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

        const updoot = await Updoot.findOne({ where: { postId, userId } })

            // user has voted before and wants to change their vote
        if(updoot && updoot.value !== realValue) {
            await getConnection().transaction(async tm => {
                await tm.query(`
                    UPDATE updoot
                    SET value = $1
                    WHERE "postId" = $2 AND "userId" = $3
                `, [realValue, postId, userId])

                await tm.query(`
                    UPDATE post
                    SET points = points + $1
                    WHERE id = $2
                `, [2 * realValue, postId])
            })
        } else if(updoot && updoot.value === realValue) {
            await getConnection().transaction(async tm => {
                await tm.query(`
                    DELETE FROM updoot
                    WHERE "postId" = $1 AND "userId" = $2
                `, [postId, userId])

                await tm.query(`
                    UPDATE post
                    SET points = points - $1
                    WHERE id = $2
                `, [realValue, postId])
            })
        } else if(!updoot) {
            // user has never voted before
            await getConnection().transaction(async tm => {
                await tm.query(`
                    INSERT INTO updoot ("userId", "postId", value)
                    VALUES ($1, $2, $3);
                `, [userId, postId, realValue])

                await tm.query(`
                    UPDATE post
                    SET points = points + $1
                    WHERE id = $2;
                `, [realValue, postId])
            });
        }

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
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
        @Ctx() { req }: MyContext
    ): Promise<PaginatedPosts> {

        const realLimit = Math.min(50, limit)
        const realLimitPlusOne = realLimit + 1

        const replacements: any[] = [
            realLimitPlusOne,
        ]

        if(req.session.userId) {
            replacements.push(req.session.userId)
        }

        let cursorIdx = 3
        if(cursor) {
            replacements.push(new Date(parseInt(cursor)))
            cursorIdx = replacements.length
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
            ) creator,
            ${
                req.session.userId
                  ? '(SELECT value FROM updoot WHERE "userId" = $2 AND "postId" = p.id) "voteStatus"'
                  : 'null AS "voteStatus"'
            }
            FROM post p
            INNER JOIN public.user u on u.id = p."creatorId"
            ${cursor ? `where p."createdAt" < $${cursorIdx}` : ""}
            ORDER BY p."createdAt" DESC
            LIMIT $1
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
        @Arg('id', () => Int) id: number
    ): Promise<Post | undefined> {
        return Post.findOne(id, { relations: ['creator'] })
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
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title') title: string,
        @Arg('text') text: string,
        @Ctx() { req }: MyContext
    ): Promise<Post | null> {
        const result = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title, text })
            .where('id = :id and "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId
            })
            .returning("*")
            .execute()

        return result.raw[0]
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<boolean> {
        await Post.delete({id, creatorId: req.session.userId})
        return true
    }
}