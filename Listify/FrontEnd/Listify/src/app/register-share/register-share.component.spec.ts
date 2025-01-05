import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterShareComponent } from './register-share.component';

describe('RegisterShareComponent', () => {
  let component: RegisterShareComponent;
  let fixture: ComponentFixture<RegisterShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterShareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
