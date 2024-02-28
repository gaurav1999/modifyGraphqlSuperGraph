import { IntrospectAndCompose } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupergraphSdlHookOptions } from '@apollo/gateway/dist/config';
import { parseGraphQLSDL } from '@graphql-tools/utils';
import { print, Kind, DefinitionNode, SchemaDefinitionNode } from 'graphql';


class CustomIntrospectClass extends IntrospectAndCompose {


  async initialize({ update, getDataSource, healthCheck }: SupergraphSdlHookOptions): Promise<{ supergraphSdl: string; cleanup: () => Promise<void>; }> {
    const { supergraphSdl, cleanup } = await super.initialize({ update, getDataSource, healthCheck });
    const schema = parseGraphQLSDL(null,supergraphSdl, { });
    
    const filteredDefinitions: DefinitionNode[] = [];
    const schemaNodeDef = schema.document.definitions.find(item => item.kind === Kind.SCHEMA_DEFINITION) as SchemaDefinitionNode;
    let resolverMap = { };

    if(schemaNodeDef) {
      const queryOp = schemaNodeDef.operationTypes.find(item => item.operation === 'query');
       const mutationOp = schemaNodeDef.operationTypes.find(item => item.operation === 'mutation');
       resolverMap['Mutation'] = mutationOp;
       resolverMap['Query'] = queryOp;
    }

    for(let index = 0; index < schema.document.definitions.length; index++) {


      const node = schema.document.definitions[index];

      if(node.kind === Kind.SCHEMA_DEFINITION) continue;

      if(node.kind === Kind.OBJECT_TYPE_DEFINITION) {
        if(node.name.value === 'Query' || node.name.value === 'Mutation') {
          const fields = [];
          node.fields.forEach(item => {
            if(item?.description?.value.includes('exposed')) fields.push(item);
          })
        if(!fields.length) {
          //If we don't have any mutation or query we need to remove from schema.
          delete resolverMap[node.name.value];
          continue;
        }
          const updateNode = { ...node, fields };
          filteredDefinitions.push(updateNode);
          continue;
        }
      }

      //Pushing other type of nodes irrespective of filters
      filteredDefinitions.push(node);
    }


    filteredDefinitions.push({
      ...schemaNodeDef,
      operationTypes: Object.values(resolverMap)
    })

    //Printing schema updated..... --->
    console.log(print({ kind: Kind.DOCUMENT, definitions: filteredDefinitions }));

    
    return { 
      supergraphSdl: print({ kind: Kind.DOCUMENT, definitions: filteredDefinitions }), 
      cleanup
    } ;
    
    // Reconstruct the schema string with filtered queries
    // const filteredSchemaString = print({
    //   kind: 'Document',
    //   definitions: filteredQueries
    // });
    
    const modifiedSchemaString = supergraphSdl.split('\n')
    .filter(line => !line.includes('@deprecated'))
    .join('\n');
    return {
      supergraphSdl,
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
