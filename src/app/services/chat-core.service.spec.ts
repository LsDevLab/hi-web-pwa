import { TestBed } from '@angular/core/testing';

import { ChatCoreService } from './chat-core.service';

describe('ChatCoreService', () => {
  let service: ChatCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
