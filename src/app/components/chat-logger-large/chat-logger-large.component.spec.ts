import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatLoggerLargeComponent } from './chat-logger-large.component';

describe('ChatLoggerLargeComponent', () => {
  let component: ChatLoggerLargeComponent;
  let fixture: ComponentFixture<ChatLoggerLargeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatLoggerLargeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatLoggerLargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
