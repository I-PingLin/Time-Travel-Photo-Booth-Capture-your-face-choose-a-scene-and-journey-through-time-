import { Component, ChangeDetectionStrategy, output, viewChild, ElementRef, AfterViewInit, OnDestroy, signal } from '@angular/core';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CameraComponent implements AfterViewInit, OnDestroy {
  photoCaptured = output<string>();
  
  videoElement = viewChild.required<ElementRef<HTMLVideoElement>>('videoElement');
  canvasElement = viewChild.required<ElementRef<HTMLCanvasElement>>('canvasElement');
  
  error = signal<string | null>(null);
  stream: MediaStream | null = null;

  ngAfterViewInit(): void {
    this.startCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  async startCamera(): Promise<void> {
    try {
      this.error.set(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        this.videoElement().nativeElement.srcObject = this.stream;
      } else {
        this.error.set('Camera access is not supported by your browser.');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      this.error.set('Could not access the camera. Please check your browser permissions.');
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  capture(): void {
    const video = this.videoElement().nativeElement;
    const canvas = this.canvasElement().nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      this.photoCaptured.emit(dataUrl.split(',')[1]);
      this.stopCamera();
    } else {
      this.error.set('Could not capture photo. Please try again.');
    }
  }
}
