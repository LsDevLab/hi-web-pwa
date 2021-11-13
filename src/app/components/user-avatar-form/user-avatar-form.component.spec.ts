import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAvatarFormComponent } from './user-avatar-form.component';

describe('UserAvatarFormComponent', () => {
  let component: UserAvatarFormComponent;
  let fixture: ComponentFixture<UserAvatarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserAvatarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAvatarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
