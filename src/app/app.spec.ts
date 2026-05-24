import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should render the Within splash and discovery hero', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.splash h1')?.textContent).toContain('Within');
    expect(compiled.querySelector('.brand-hero')?.textContent).toContain('Discover');
    expect(compiled.querySelector('.brand-hero')?.textContent).toContain('Within');
  });

  it('should switch pillars and show matching events', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.dismissSplash();
    app.selectPillar('Seek');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Full Moon Meditation Circle');
    expect(compiled.textContent).not.toContain('Sunrise Yoga by the River');
  });

  it('should mark an event as joined and increment its joined count', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const event = app.filteredEvents()[0];

    app.joinEvent(event.id);
    fixture.detectChanges();

    expect(app.isJoined(event.id)).toBeTrue();
    expect(app.joinedCount(event)).toBe(event.joined + 1);
  });
});
