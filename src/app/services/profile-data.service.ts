import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import {BehaviorSubject} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProfileDataService {

  private isAtLeastOneToNotifySource = new BehaviorSubject<boolean>(false);
  isAtLeastOneToNotifyObservable = this.isAtLeastOneToNotifySource.asObservable();

  constructor() {

  }

  setNotify(isAtLeastOneToNotify: boolean){
    this.isAtLeastOneToNotifySource.next(isAtLeastOneToNotify);
  }

}
