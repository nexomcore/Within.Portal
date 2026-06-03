import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-conversation-guide-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './conversation-guide-page.component.html',
})
export class ConversationGuidePageComponent {
  protected readonly userSections = [
    { title: 'Current behaviour', questions: ['Tell me about the last wellbeing, fitness, mindfulness, spiritual, or community event you attended.', 'How did you find it?', 'What made you decide to go?', 'How was the booking or registration process?'] },
    { title: 'Discovery problem', questions: ['Where do you usually look?', 'What is frustrating about finding these experiences?', 'What information do you need before deciding?', 'What would make you trust this app?'] },
    { title: 'Feature priority', questions: ['Which feature would matter most?', 'Which feature can wait?', 'What would make this better than Instagram, Facebook, Meetup, or Eventbrite?'] },
  ];

  protected readonly providerSections = [
    { title: 'Provider background', questions: ['Tell me about what you offer.', 'Who is your typical customer?', 'Are you full-time or part-time?', 'How long have you been offering these services?'] },
    { title: 'Current promotion', questions: ['How do people discover you?', 'Which channels work best?', 'How much time do you spend promoting each event?', 'Do you pay for ads?'] },
    { title: 'Provider features', questions: ['Which provider features matter most?', 'What would you need on day one?', 'What would make this better than your current tools?', 'Would you join the Perth pilot?'] },
  ];
}
