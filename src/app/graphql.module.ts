import {NgModule} from '@angular/core';
import {APOLLO_OPTIONS} from 'apollo-angular';
import {ApolloClientOptions, InMemoryCache, ApolloLink} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';

import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { WebSocketLink } from 'apollo-link-ws';
//import { HttpLink } from 'apollo-angular-link-http';  //Documentation use this import, but Data wasn't with it
//so i use the oder one up
import { setContext } from 'apollo-link-context';
import { ChatCoreService } from './services/chat-core.service';

const httpUri = 'https://aspiring-thing.us-west-2.aws.cloud.dgraph.io/graphql';//'http://localhost:8080/graphql';
const wsUri = 'wss://aspiring-thing.us-west-2.aws.cloud.dgraph.io/graphql';//'ws://localhost:8080/graphql';

//const httpUri = 'https://34.82.65.255/graphql';//'http://localhost:8080/graphql';
//const wsUri = 'wss://34.82.65.255/graphql';//'ws://localhost:8080/graphql';

console.log("GQLM: Apollo settings module loaded")
export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {

 var token = localStorage.getItem('currentToken');
 //console.log("create apollo with token", token);

  const authContext = setContext(async(operation, context) => {
    if (token === null) {
      return {};
    } else {
      let returnValue = {
        headers: {
          "X-Auth-Token": `${token}`
        }
      };
      //console.log("HTTP Request Token", returnValue);
      return returnValue;
    }
  });


  //Create a HttpLink
  const http = ApolloLink.from([authContext as any, httpLink.create({uri: httpUri})]);

  // Create a WebSocket link, subscription link
  const ws = WebSocketLink.from([new WebSocketLink({
    uri: wsUri,
    options: {
      reconnect: true,
      connectionParams: {
        "X-Auth-Token": `${token}`
      }
    }
    })
  ]);

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
