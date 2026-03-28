import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { LightNovel } from '@core/models/LightNovel';
import { LightnovelItem } from '../lightnovel-item/lightnovel-item';

@Component({
    selector: 'app-lightnovel-list',
    imports: [LightnovelItem],
    templateUrl: './lightnovel-list.html',
    styleUrl: './lightnovel-list.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LightnovelList {
    lightNovels = input.required<LightNovel[]>();
}
