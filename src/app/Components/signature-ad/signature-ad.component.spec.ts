import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureAdComponent } from './signature-ad.component';

describe('SignatureAdComponent', () => {
  let component: SignatureAdComponent;
  let fixture: ComponentFixture<SignatureAdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignatureAdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignatureAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
