import {NgModule} from '@angular/core';
import {APOLLO_OPTIONS} from 'apollo-angular';
import {ApolloClientOptions, InMemoryCache} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';

import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { WebSocketLink } from 'apollo-link-ws';
//import { HttpLink } from 'apollo-angular-link-http';  //Documentation use this import, but Data wasn't with it
//so i use the oder one up


const httpUri = 'https://afraid-bridge.us-west-2.aws.cloud.dgraph.io/graphql';//'http://localhost:8080/graphql'; 
const wsUri = 'wss://afraid-bridge.us-west-2.aws.cloud.dgraph.io/graphql';//'ws://localhost:8080/graphql';

export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
//Create a HttpLink
  const http = httpLink.create({uri: httpUri})

  // Create a WebSocket link, subscription link
  const ws = new WebSocketLink({
    uri: wsUri,
    options: {
      reconnect: true
    }
  });

  const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  ws,
  http as any //need it
  ); 


  return {
    link: link as any, //need it , replace by link:http as any , if you want to ignore the subscription
    cache: new InMemoryCache(),
  };
}

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
