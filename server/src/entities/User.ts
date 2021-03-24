import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'

@ObjectType() //we can stack the decorators
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field(() => String, { nullable: true })
    @CreateDateColumn()
    createdAt!: Date

    @Field(() => String, { nullable: true })
    @UpdateDateColumn()
    updatedAt!: Date

    @Field()
    @Column({ unique: true })
    username!: string

    @Field()
    @Column({ unique: true })
    email!: string

    @Column()
    password!: string
}