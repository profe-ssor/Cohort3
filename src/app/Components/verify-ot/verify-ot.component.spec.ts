import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyOtComponent } from './verify-ot.component';

describe('VerifyOtComponent', () => {
  let component: VerifyOtComponent;
  let fixture: ComponentFixture<VerifyOtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyOtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyOtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
