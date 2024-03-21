import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: "This is user field used to direct something description etc" })
@Directive('@key(fields: "id")')
export class User {
  @Field((type) => ID)
  id: number;

  @Field()
  name: string;
}
