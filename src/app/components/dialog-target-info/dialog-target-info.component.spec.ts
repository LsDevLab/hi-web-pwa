import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTargetInfoComponent } from './dialog-target-info.component';

describe('DialogTargetInfoComponent', () => {
  let component: DialogTargetInfoComponent;
  let fixture: ComponentFixture<DialogTargetInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogTargetInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTargetInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
