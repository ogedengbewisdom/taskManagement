import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSearchSelector } from './user-search-selector';

describe('UserSearchSelector', () => {
  let component: UserSearchSelector;
  let fixture: ComponentFixture<UserSearchSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSearchSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSearchSelector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
