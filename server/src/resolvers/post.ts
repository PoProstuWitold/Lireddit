import { isAuth } from '../middlewares/isAuth'
import { MyContext } from '../types'
import { Arg, Mutation, Query, Resolver, Field, InputType, Ctx, UseMiddleware, ObjectType } from 'type-graphql'
import { Post } from '../entities/Post'
import insertedDataHandler from '../utils/insertedDataHandler'
import { postSchema } from '../utils/validation'
import { FieldError } from './user'
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

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(): Promise<Post[]> {
        return Post.find()
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