import { Component, ChangeDetectionStrategy, signal, inject, OnDestroy, effect } from '@angular/core';
import { CameraComponent } from './components/camera/camera.component';
import { SceneSelectorComponent } from './components/scene-selector/scene-selector.component';
import { ResultDisplayComponent } from './components/result-display/result-display.component';
import { HistoricalScene } from './models/historical-scene.model';
import { GeminiService } from './services/gemini.service';

type AppView = 'initial' | 'capturing' | 'captured' | 'selecting' | 'generating' | 'result';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnDestroy {
  private geminiService = inject(GeminiService);

  view = signal<AppView>('initial');
  isLoading = signal(false);
  loadingMessage = signal('');
  errorMessage = signal<string | null>(null);
  userPhoto = signal<string | null>(null);
  selectedScene = signal<HistoricalScene | null>(null);
  finalImage = signal<string | null>(null);

  private loadingInterval: any;
  private readonly loadingMessages = [
    'Calibrating the chronometer...',
    'Navigating the time vortex...',
    'Rendering historical photons...',
    'Asking Leonardo da Vinci for tips...',
    'Avoiding temporal paradoxes...',
    'Weaving timelines...',
  ];

  scenes: HistoricalScene[] = [
    {
      id: 'moon_landing',
      title: 'First Moon Landing',
      description: 'Become an Apollo astronaut on the lunar surface.',
      thumbnailUrl: 'https://picsum.photos/seed/moon/400/300',
      generatorPrompt: 'A grainy, 1960s photograph of an astronaut on the moon. The astronaut has their helmet off, revealing a face with these features: {description}. The style is reminiscent of original Apollo 11 mission photos, with harsh lighting and the Earth in the background.'
    },
    {
      id: 'roman_forum',
      title: 'Roman Senator',
      description: 'Address the crowds as a powerful senator in ancient Rome.',
      thumbnailUrl: 'https://picsum.photos/seed/rome/400/300',
      generatorPrompt: 'A vibrant, realistic oil painting of a senator in the Roman Forum, wearing a toga. The senator has these features: {description}. The scene includes marble columns and bright sunlight, in the style of a classical painting.'
    },
    {
      id: 'pharaoh',
      title: 'Egyptian Pharaoh',
      description: 'Rule over ancient Egypt from your golden throne.',
      thumbnailUrl: 'https://picsum.photos/seed/egypt/400/300',
      generatorPrompt: 'A detailed Egyptian mural of a Pharaoh on a throne. The pharaoh has these features: {description}, and is wearing a nemes headdress. The style is similar to ancient Egyptian art with rich colors and hieroglyphics.'
    },
    {
      id: 'knight',
      title: 'Medieval Knight',
      description: 'Don shining armor and stand before a medieval castle.',
      thumbnailUrl: 'https://picsum.photos/seed/knight/400/300',
      generatorPrompt: 'A photorealistic portrait of a medieval knight in shining plate armor, standing in front of a stone castle. The knight is not wearing a helmet and has a face with these features: {description}. The lighting is dramatic and the mood is stoic.'
    },
    {
      id: 'jazz_age',
      title: '1920s Jazz Club',
      description: 'Enjoy the music at a speakeasy during the Roaring Twenties.',
      thumbnailUrl: 'https://picsum.photos/seed/jazz/400/300',
      generatorPrompt: 'A moody, sepia-toned photograph of a person in a 1920s jazz club. The person is dressed in period attire and has a face with these features: {description}. The atmosphere is smoky and filled with dimly lit tables and a band in the background.'
    },
     {
      id: 'dino_explorer',
      title: 'Dinosaur Explorer',
      description: 'Witness majestic dinosaurs in a prehistoric jungle.',
      thumbnailUrl: 'https://picsum.photos/seed/dino/400/300',
      generatorPrompt: 'A hyperrealistic digital painting of an explorer in a lush prehistoric jungle, looking in awe at a Brachiosaurus. The explorer has a face with these features: {description}. The scene is filled with giant ferns and dramatic lighting filtering through the canopy.'
    }
  ];
  
  constructor() {
    effect(() => {
        if(this.isLoading()) {
            this.startLoadingMessages();
        } else {
            this.stopLoadingMessages();
        }
    });
  }

  ngOnDestroy(): void {
    this.stopLoadingMessages();
  }

  startCapture(): void {
    this.errorMessage.set(null);
    this.view.set('capturing');
  }

  onPhotoCaptured(photo: string): void {
    this.userPhoto.set(photo);
    this.view.set('captured');
  }

  retakePhoto(): void {
    this.userPhoto.set(null);
    this.view.set('capturing');
  }

  usePhoto(): void {
    this.view.set('selecting');
  }

  onSceneSelected(scene: HistoricalScene): void {
    this.selectedScene.set(scene);
    this.generateTimeTravelPhoto();
  }

  async generateTimeTravelPhoto(): Promise<void> {
    const photo = this.userPhoto();
    const scene = this.selectedScene();
    if (!photo || !scene) return;

    this.view.set('generating');
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const description = await this.geminiService.describeFace(photo);
      const imageBytes = await this.geminiService.generateHistoricalImage(description, scene.generatorPrompt);
      this.finalImage.set(imageBytes);
      this.view.set('result');
    } catch (error: any) {
      this.errorMessage.set(error.message || 'An unknown error occurred.');
      this.view.set('selecting'); // Go back to scene selection on error
    } finally {
      this.isLoading.set(false);
    }
  }

  startOver(): void {
    this.view.set('initial');
    this.userPhoto.set(null);
    this.selectedScene.set(null);
    this.finalImage.set(null);
    this.errorMessage.set(null);
  }

  private startLoadingMessages(): void {
    this.loadingMessage.set(this.loadingMessages[0]);
    let i = 1;
    this.loadingInterval = setInterval(() => {
      this.loadingMessage.set(this.loadingMessages[i % this.loadingMessages.length]);
      i++;
    }, 2500);
  }

  private stopLoadingMessages(): void {
    clearInterval(this.loadingInterval);
  }
}
