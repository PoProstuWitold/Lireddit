import { MyContext } from '../types'
import { Field, InputType, Mutation, Resolver, Arg, Ctx, ObjectType, Query} from 'type-graphql'
import { User } from '../entities/User'
import argon2 from 'argon2'
import { registerSchema } from '../utils/validation'
import insertedDataHandler from '../utils/insertedDataHandler'
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants'
import { sendEmail } from '../utils/sendEmail'
import { v4 } from 'uuid'
import { getConnection } from 'typeorm'

@InputType()
class UsernamePasswordInput {
    @Field()
    email: string

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
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {

        const errors = insertedDataHandler(registerSchema, options)

        if(errors) {
            return { errors }
        }


        const hashedPassword = await argon2.hash(options.password);
    let user;
        try {
            // User.create({}).save()
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    username: options.username,
                    email: options.email,
                    password: hashedPassword,
                })
                .returning("*")
                .execute();
            user = result.raw[0];
        } catch(err) {  //|| err.detail.includes("already exists"))
            if (err.code === '23505' && err.detail.includes('username')) { //PostgreSQL duplicate error code
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username already taken",
                        }
                    ]
                }
            }
            if (err.code === '23505' && err.detail.includes('email')) { //PostgreSQL duplicate error code
                return {
                    errors: [
                        {
                            field: "email",
                            message: "email already taken",
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
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne(
            usernameOrEmail.includes('@')
                ? { where: { email: usernameOrEmail } }
                : { where: { username: usernameOrEmail } }
        )

        if(!user) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: "Invalid credentials"
                    },
                    {
                        field: "password",
                        message: "Invalid credentials"
                    }
                ]
            }
        }

        const isMatch = await argon2.verify(user.password, password)

        if(!isMatch) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: "Invalid credentials"
                    },
                    {
                        field: "password",
                        message: "Invalid credentials"
                    }
                ]
            }
        }

        req.session.userId = user.id
        
        return { user }
    }

    @Query(() => User, { nullable: true })
    me(
        @Ctx() { req }: MyContext
    ) {
        // not logged
        if(!req.session.userId) {
            return null
        }

        return User.findOne(req.session.userId)
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        return new Promise(resolve => req.session.destroy(err => {
            // clear session cookie even if there is an error
            // res.clearCookie(COOKIE_NAME)

            if(err) {
                console.log(err)
                resolve(false)
                return
            }
            //clear session cookie only if there's no an error
            res.clearCookie(COOKIE_NAME)
            resolve(true)
        }))
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: { email } }) // if not PK

        if(!user) {
            // email not in db
            return true
        }


        const token = v4()

        await redis.set(
            FORGET_PASSWORD_PREFIX + token,
            user.id,
            'ex',
            1000 * 60 * 60 * 24 * 3 // 3 days until expires
        )

        sendEmail(
            email,
            'Change password',
            `<a href="http://localhost:3000/change-password/${token}" target="_blank">Reset password</a>`
        )

        return true
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {

        if (newPassword.length <= 2 || newPassword.length > 50) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "length must be greater than 2 and less than 50",
                    },
                ],
            }
        }

        const key = FORGET_PASSWORD_PREFIX + token
        const userId = await redis.get(key)
        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "Token expired",
                    },
                ],
            }
        }

        const userIdNum = parseInt(userId)
        const user = await User.findOne(userIdNum) 
        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "User no longer exists",
                    },
                ],
            }
        }

        await User.update(
            { id: userIdNum }, 
            {
            password: await argon2.hash(newPassword)
            }
        )

        await redis.del(key)

        // login after changing password
        req.session.userId = user.id

        return { user }
    }
}

export { FieldError }