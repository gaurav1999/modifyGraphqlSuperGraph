import {
  Args,
  Directive,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Post } from './models/post.model';
import { User } from './models/user.model';
import { PostsService } from './posts.service';
import { ParseIntPipe } from '@nestjs/common';

@Resolver((of) => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  // @Directive('@deprecated(reason: "This query will be removed in the next version")')
  @Query((returns) => Post, /*{ description: "@gateway(internal)" }*/)
  internal_postModified(@Args({ name: 'id', type: () => ID }, ParseIntPipe) id: number): Post {
    return this.postsService.findOne(id);
  }

  @Query((returns) => [Post], /*{ description: "@gateway(exposed)" }*/)
  external_posts(): Post[] {
    return this.postsService.findAll();
  }

  @ResolveField((of) => User)
  user(@Parent() post: Post): any {
    return { __typename: 'User', id: post.authorId };
  }
}
