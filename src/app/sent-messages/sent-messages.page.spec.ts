import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SentMessagesPage } from './sent-messages.page';

describe('SentMessagesPage', () => {
  let component: SentMessagesPage;
  let fixture: ComponentFixture<SentMessagesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SentMessagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
