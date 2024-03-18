import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity()
@ObjectType()
export class ApiToken {
  @PrimaryGeneratedColumn('uuid')
  @Field({ nullable: false })
  id: string;

  @Column({ length: 128, unique: true })
  accessKey: string;

  @Column({ type: 'uuid' })
  legalEntityId: string;

  @Column({ type: 'text' })
  jwtToken: string;


  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  permissionGroupId: string;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  @Field({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn()
  @Field({ nullable: false })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true  })
  @Field({ nullable: false })
  deletedAt: Date;
}


export enum ExpiryTokenInput {
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR',
    NONE = 'NONE',
}

registerEnumType(ExpiryTokenInput, {
    name: 'ExpiryTokenInput',
});