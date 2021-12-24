import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../../interfaces/dataTypes';

@Component({
  selector: 'app-user-data-form',
  templateUrl: './user-data-form.component.html',
  styleUrls: ['./user-data-form.component.css']
})
export class UserDataFormComponent implements OnInit {

  @Input() name = '';
  @Input() surname = '';
  @Input() bio = '';
  @Input() age: number;
  @Input() sex = '';
  @Input() loading;

  @Output() formSubmit = new EventEmitter<Partial<User>>();

  constructor() { }

  ngOnInit(): void {
  }

}
