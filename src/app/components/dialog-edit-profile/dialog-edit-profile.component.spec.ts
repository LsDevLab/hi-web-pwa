import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditProfileComponent } from './dialog-edit-profile.component';

describe('DialogAddChatComponent', () => {
  let component: DialogEditProfileComponent;
  let fixture: ComponentFixture<DialogEditProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogEditProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogEditProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
