import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-access-form',
  templateUrl: './access-form.component.html',
  styleUrls: ['./access-form.component.css']
})
export class AccessFormComponent implements OnInit {

  showPassword = false;

  @Input() signingMode;
  @Input() email = '';
  @Input() password = '';
  @Input() name = '';
  @Input() surname = '';
  @Input() bio = '';
  @Input() age: number;
  @Input() sex = '';
  @Input() accessErrorMessage;
  @Input() resetEmailMessage;
  @Input() loading;

  @Output() loginWithGoogle = new EventEmitter<any>();
  @Output() sendResetPasswordMail = new EventEmitter<string>();
  @Output() formSubmit = new EventEmitter<{ email: string, password: string }>();

  constructor() { }

  ngOnInit(): void {
  }

  getInputType(): string {
    if (this.showPassword) {
      return 'text';
    }
    return 'password';
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

}
