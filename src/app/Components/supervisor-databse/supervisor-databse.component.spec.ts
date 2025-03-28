import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorDatabseComponent } from './supervisor-databse.component';

describe('SupervisorDatabseComponent', () => {
  let component: SupervisorDatabseComponent;
  let fixture: ComponentFixture<SupervisorDatabseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisorDatabseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupervisorDatabseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
