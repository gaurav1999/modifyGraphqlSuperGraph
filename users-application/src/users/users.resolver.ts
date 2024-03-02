import { Args, ID, Mutation, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query((returns) => User, { description: "@gateway(default)" })
  getUser(@Args({ name: 'id', type: () => ID }) id: number): User {
    return this.usersService.findById(id);
  }

  @Mutation((returns) => User, { description: "@gateway(internal)" })
  constructUser(@Args({ name: 'id', type: () => ID }) id: number): User {
    return this.usersService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: number }): User {
    return this.usersService.findById(reference.id);
  }
}
