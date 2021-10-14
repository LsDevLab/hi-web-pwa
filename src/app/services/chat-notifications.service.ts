import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';

const pnsUri = 'https://p74319.deta.dev';

@Injectable({
  providedIn: 'root'
})
export class ChatNotificationsService {

  readonly VAPID_PUBLIC_KEY = "BP07KrtTn9S37-WusRWp-Y2OBWcFmo8rG0wb5hjhcYbArBd5xdNa2qkFLesxwKhidy0_t213r5ZEk0eeLO05Ol4";

  username: string;

  constructor(public swPush: SwPush, private http: HttpClient) {

  }

  unsubscribeToMessagesPushNotifications(){
    this.swPush.subscription.subscribe(currentSub => {
      if (currentSub){
        let request = {'subscription_info': currentSub, 'username': this.username};
        let subJSON = JSON.stringify(request);
        this.http.post(pnsUri + "/messages/push/unsubscribe", JSON.parse(subJSON)).subscribe(data => {
          this.swPush.unsubscribe();
          console.log("CNS: unsubscribed from push notifications server with response", data);
        });
      }
    });
  }

  subscribeToMessagesPushNotifications(username){
    this.username = username;
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => {
      let request = {'subscription_info': sub, 'username': username}
      let subJSON = JSON.stringify(request);
      this.http.post(pnsUri + "/messages/push/subscribe", JSON.parse(subJSON)).subscribe(data => {
        console.log("CNS: subscription request response from the server", data);
      });
    })
    .catch(err => console.error("CNS: could not subscribe to message notifications server", err));
    }

  sendMessagePushNotification(text, currentUsername, targetUsername){
    let json = JSON.stringify({"text": text, "senderUsername": currentUsername, "receiverUsername": targetUsername});
      this.http.post(pnsUri + "/messages/push", JSON.parse(json)).subscribe(data => {
        console.log("CNS: message push notification sent to server with response", data);
      });
  }
}
