import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectStatus } from './select-status';

describe('SelectStatus', () => {
  let component: SelectStatus;
  let fixture: ComponentFixture<SelectStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
