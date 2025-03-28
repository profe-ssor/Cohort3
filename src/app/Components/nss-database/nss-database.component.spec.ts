import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NssDatabaseComponent } from './nss-database.component';

describe('NssDatabaseComponent', () => {
  let component: NssDatabaseComponent;
  let fixture: ComponentFixture<NssDatabaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NssDatabaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NssDatabaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
