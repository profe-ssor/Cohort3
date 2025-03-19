import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeronelDashBoardComponent } from './peronel-dash-board.component';

describe('PeronelDashBoardComponent', () => {
  let component: PeronelDashBoardComponent;
  let fixture: ComponentFixture<PeronelDashBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeronelDashBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeronelDashBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
