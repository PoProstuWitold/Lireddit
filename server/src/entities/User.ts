import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { Post } from './Post'
import { Updoot } from './Updoot'

@ObjectType() //we can stack the decorators
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column({ unique: true })
    username!: string

    @Field()
    @Column({ unique: true })
    email!: string

    @Column()
    password!: string

    @OneToMany(() => Post, post => post.creator)
    posts: Post[]
    
    @OneToMany(() => Updoot, updoot => updoot.user)
    updoots: Updoot[]
    
    @Field(() => String)
    @CreateDateColumn({ name: 'createdAt'})
    createdAt!: Date

    @Field(() => String)
    @UpdateDateColumn({ name: 'updatedAt'})
    updatedAt!: Date
}