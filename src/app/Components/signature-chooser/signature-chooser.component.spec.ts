import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureChooserComponent } from './signature-chooser.component';

describe('SignatureChooserComponent', () => {
  let component: SignatureChooserComponent;
  let fixture: ComponentFixture<SignatureChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignatureChooserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignatureChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
