import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddChatComponent } from './dialog-add-chat.component';

describe('DialogAddChatComponent', () => {
  let component: DialogAddChatComponent;
  let fixture: ComponentFixture<DialogAddChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogAddChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAddChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
