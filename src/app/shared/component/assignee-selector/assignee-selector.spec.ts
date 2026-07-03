import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigneeSelector } from './assignee-selector';

describe('AssigneeSelector', () => {
  let component: AssigneeSelector;
  let fixture: ComponentFixture<AssigneeSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssigneeSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssigneeSelector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
