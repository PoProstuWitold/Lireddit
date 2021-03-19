import { MyContext } from '../types'
import { Field, InputType, Mutation, Resolver, Arg, Ctx, ObjectType, Query} from 'type-graphql'
import { User } from '../entities/User'
import argon2 from 'argon2'

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string

    @Field()
    password: string
}


@ObjectType()
class FieldError {
    @Field()
    field: string

    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}


@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {

        if(options.username.length <= 2 || options.password.length <= 2) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "Length must be greater than 2",
                    },
                    {
                        field: "password",
                        message: "length must be greater than 2",
                    }
                ]
            }
        }

        if(options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "Length must be greater than 2",
                    }
                ]
            }
        }

        if(options.password.length <= 2) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "length must be greater than 2",
                    }
                ]
            }
        }

        const hashedPassword = await argon2.hash(options.password)

        const user = em.create(User, {
            username: options.username,
            password: hashedPassword
        })

        try {
            await em.persistAndFlush(user)
        } catch(err) {  //|| err.detail.includes("already exists"))
            if (err.code === '23505') { //PostgreSQL duplicate error code
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username already taken",
                        }
                    ]
                }
            }
        }

        req.session.userId = user.id

        return { user }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username })

        if(!user) {
            return {
                errors: [
                    {
                        field: "username or email",
                        message: "Invalid credentials"
                    }
                ]
            }
        }

        const isMatch = await argon2.verify(user.password, options.password)

        if(!isMatch) {
            return {
                errors: [
                    {
                        field: "username or email",
                        message: "Invalid credentials"
                    }
                ]
            }
        }

        req.session.userId = user.id
        
        return { user }
    }

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req, em }: MyContext
    ) {
        // not logged
        if(!req.session.userId) {
            return null
        }

        const user = await em.findOne(User, { id: req.session.userId })

        return user
    }
}