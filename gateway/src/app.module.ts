import { IntrospectAndCompose } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupergraphSdlHookOptions } from '@apollo/gateway/dist/config';


class CustomIntrospectClass extends IntrospectAndCompose {

  async initialize({ update, getDataSource, healthCheck }: SupergraphSdlHookOptions): Promise<{ supergraphSdl: string; cleanup: () => Promise<void>; }> {
    const { supergraphSdl, cleanup } = await super.initialize({ update, getDataSource, healthCheck });
    // const schema = parseGraphQLSDL(null,supergraphSdl, { });
    // console.log(supergraphSdl);
    const modifiedSchemaString = supergraphSdl.split('\n')
    .filter(line => !line.includes('internalResolver_'))
    .join('\n');

    return {
      supergraphSdl: modifiedSchemaString,
      cleanup
    }
  }

  // private async updateSupergraphSdl() {
  //   return this.updateSupergraphSdl();
  // }


}

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      gateway: {
        supergraphSdl: new CustomIntrospectClass({
            subgraphs: [
              { name: 'users', url: 'http://localhost:3002/graphql',  },
              { name: 'posts', url: 'http://localhost:3003/graphql' },
            ],
            introspectionHeaders: { "Authorization":  "Bearer auth 1234"},
          }
        ), 
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
