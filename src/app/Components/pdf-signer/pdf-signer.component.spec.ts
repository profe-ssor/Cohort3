import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfSignerComponent } from './pdf-signer.component';

describe('PdfSignerComponent', () => {
  let component: PdfSignerComponent;
  let fixture: ComponentFixture<PdfSignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfSignerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfSignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
