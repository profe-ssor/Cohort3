import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NssAssignmentsComponent } from './nss-assignments.component';

describe('NssAssignmentsComponent', () => {
  let component: NssAssignmentsComponent;
  let fixture: ComponentFixture<NssAssignmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NssAssignmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NssAssignmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
