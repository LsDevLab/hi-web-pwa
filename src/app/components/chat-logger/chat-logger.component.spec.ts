import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatLoggerComponent } from './chat-logger.component';

describe('ChatLoggerComponent', () => {
  let component: ChatLoggerComponent;
  let fixture: ComponentFixture<ChatLoggerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatLoggerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatLoggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
