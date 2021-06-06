import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTokenExpiredComponent } from './dialog-token-expired.component';

describe('DialogTokenExpiredComponent', () => {
  let component: DialogTokenExpiredComponent;
  let fixture: ComponentFixture<DialogTokenExpiredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogTokenExpiredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTokenExpiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
