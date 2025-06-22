import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitEvaluationComponent } from './submit-evaluation.component';

describe('SubmitEvaluationComponent', () => {
  let component: SubmitEvaluationComponent;
  let fixture: ComponentFixture<SubmitEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitEvaluationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
