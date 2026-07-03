import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteResponse } from './invite-response';

describe('InviteResponse', () => {
  let component: InviteResponse;
  let fixture: ComponentFixture<InviteResponse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteResponse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InviteResponse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
