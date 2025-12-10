import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { HistoricalScene } from '../../models/historical-scene.model';

@Component({
  selector: 'app-scene-selector',
  templateUrl: './scene-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneSelectorComponent {
  scenes = input.required<HistoricalScene[]>();
  sceneSelected = output<HistoricalScene>();

  selectScene(scene: HistoricalScene): void {
    this.sceneSelected.emit(scene);
  }
}
