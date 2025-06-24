import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrOfertaComponent } from './qr-oferta.component';

describe('QrOfertaComponent', () => {
  let component: QrOfertaComponent;
  let fixture: ComponentFixture<QrOfertaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrOfertaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrOfertaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
