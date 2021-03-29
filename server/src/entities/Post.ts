import { Field, ObjectType } from 'type-graphql'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne } from 'typeorm'
import { User } from './User'

@ObjectType() //we can stack the decorators
@Entity()
export class Post extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    title!: string

    @Field()
    @Column()
    text!: string

    @Field()
    @Column({ type: 'int', default: 0 })
    points!: number

    @Field()
    @Column({ name: 'creatorId' })
    creatorId: number

    @Field()
    @ManyToOne(() => User, user => user.posts)
    creator: User

    @Field(() => String)
    @CreateDateColumn({ name: 'createdAt'})
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date
}