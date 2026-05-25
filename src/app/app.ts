import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Within');
  protected readonly waitlistEmail = signal('');
  protected readonly waitlistName = signal('');
  protected readonly waitlistRole = signal('Early user');
  protected readonly submitted = signal(false);

  protected readonly pillars = [
    {
      name: 'Move',
      label: 'Move your body',
      description: 'Find fitness, yoga, pilates, mobility, walking groups, and active experiences that support everyday physical wellbeing.',
      accent: 'move',
    },
    {
      name: 'Feel',
      label: 'Support your mind',
      description: 'Explore meditation, breathwork, reflection, social connection, and emotional wellbeing experiences in one calm place.',
      accent: 'feel',
    },
    {
      name: 'Seek',
      label: 'Go deeper',
      description: 'Discover retreats, mindfulness, purpose-led sessions, spiritual exploration, and practices for personal growth.',
      accent: 'seek',
    },
  ];

  protected readonly features = [
    {
      category: 'Discover',
      title: 'Wellbeing events and retreats',
      detail: 'Browse curated experiences across movement, emotional wellbeing, mindfulness, and personal growth.',
    },
    {
      category: 'Connect',
      title: 'Trusted hosts and community circles',
      detail: 'Meet verified practitioners, local providers, retreat hosts, and groups aligned with your interests.',
    },
    {
      category: 'Grow',
      title: 'Save, join, and build your path',
      detail: 'Keep track of experiences you care about and return to practices that help you feel more balanced.',
    },
  ];

  protected readonly providerPoints = [
    'Share your wellbeing events, workshops, circles, or retreats',
    'Reach people looking for holistic wellbeing experiences',
    'Build trust with a verified provider presence',
    'Register interest now while the platform is in development',
  ];

  protected submitWaitlist(): void {
    if (!this.waitlistEmail().trim()) {
      return;
    }

    this.submitted.set(true);
  }
}
