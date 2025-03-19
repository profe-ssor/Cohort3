import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResenOtpComponent } from './resen-otp.component';

describe('ResenOtpComponent', () => {
  let component: ResenOtpComponent;
  let fixture: ComponentFixture<ResenOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResenOtpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResenOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
