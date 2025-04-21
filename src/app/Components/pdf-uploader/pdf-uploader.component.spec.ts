import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfUploaderComponent } from './pdf-uploader.component';

describe('PdfUploaderComponent', () => {
  let component: PdfUploaderComponent;
  let fixture: ComponentFixture<PdfUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfUploaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
