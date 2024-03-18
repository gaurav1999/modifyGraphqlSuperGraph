import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { User } from './models/user.model';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { UsersResolver } from './users.resolver';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiToken } from '../api-token/entities/api-token.entity';
// import { DirectiveLocation, GraphQLDirective, buildASTSchema } from 'graphql';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: 5432,
      username: process.env.POSTGRES_USER || 'myuser',
      password: process.env.POSTGRES_PASSWORD || 'mypassword',
      database: process.env.TOKEN_DB || 'skuad_token',
      entities: [ApiToken],
      synchronize: true,
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
      plugins: [ApolloServerPluginInlineTrace()],
      transformSchema: (schema) => {
        //This function could be used to return a transformed schema from the subgraph 
        //By removing the fieldName
        //Currently this is commented.
        return schema;
        // const testFn = (fieldName: string) => fieldName === 'postModified'; // Assuming 'postModified' is the name of the query you want to exclude
        // // Remove the 'postModified' field from the query type
        // const [transformedSchema] = removeObjectFields(schema, 'Query', (fieldName) => testFn(fieldName));
        // return transformedSchema;

      },
      buildSchemaOptions: {
        orphanedTypes: [User],
        directives: [ new GraphQLDirective({
          name: 'internal',
          locations: [DirectiveLocation.QUERY]
        })]
      },
    }),
  ],
  providers: [PostsService, PostsResolver, UsersResolver],
})
export class PostsModule {}
