import { TestBed } from '@angular/core/testing';

import { LightNovelService } from './lightnovel.service';

describe('LightNovelService', () => {
    let service: LightNovelService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LightNovelService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
