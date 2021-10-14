import {
  Component,
  Input,
  OnInit
} from '@angular/core';

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
