import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  OnInit,
  OnDestroy,
  ElementRef,
  SimpleChanges,
  NgZone,
  Injector,
  ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'circle-progress-bar',
  templateUrl: './circle-progress-bar.component.html',
  styleUrls: ['./circle-progress-bar.component.css']
})
export class CircleProgressComponent implements OnInit {

  @Input()
  progress: number;

  @Input()
  radius: any;

  @Input()
  trackWeight: any;

  @Input()
  trackColor: any;

  @Input()
  trackEndShape: any;

  constructor() {
  }

  ngOnInit() {
  }


}
