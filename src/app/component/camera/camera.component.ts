import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
import * as Tesseract from 'tesseract.js';

declare var ImageCapture: any;

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css'],
})
export class CameraComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef;
  video!: HTMLVideoElement;
  canvas!: HTMLCanvasElement;
  stream: MediaStream | undefined;
  scanInterval: any;
  capturedImage: string | null = null; // Store the captured image data URL

  constructor(private toastService: ToastService, private http: HttpClient) {}

  ngAfterViewInit() {
    this.startCamera();
  }

  startCamera() {
    this.video = this.videoElement.nativeElement;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 720 },
          height: { ideal: 1280 },
          facingMode: 'environment',
        },
      })
      .then((stream) => {
        this.stream = stream;
        this.video.srcObject = stream;
        this.video.play();
        this.startScanning();
      })
      .catch(() => {
        this.toastService.showError(
          'Please enable camera access in your settings.'
        );
      });
  }

  startScanning() {
    this.scanInterval = setInterval(() => {
      this.captureAndProcessFrame();
    }, 1000);
  }

  async onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const img = await this.loadImage(file);
      const bitmap = await createImageBitmap(img);
      this.processFrame(bitmap);
    }
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = URL.createObjectURL(file);
    });
  }

  captureAndProcessFrame() {
    if (!this.stream) return;
    const track = this.stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);

    imageCapture
      .grabFrame()
      .then((imageBitmap: ImageBitmap) => {
        this.processFrame(imageBitmap);
      })
      .catch((err: Error) => console.error('Frame Capture Error:', err));
    return;
  }

  processFrame(imageBitmap: ImageBitmap) {
    const canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(imageBitmap, 0, 0);

    this.preprocessImage(context, canvas);

    const frameData = canvas.toDataURL('image/png');
    this.capturedImage = frameData;

    // this.runOcrLocally(frameData);
    this.runFreeOcrApi(frameData)
      .then((result) => {
        result.ParsedResults?.forEach((parsedResult: any) => {
          const expirationDate = this.extractExpirationDate(
            parsedResult.ParsedText
          );
          if (expirationDate) {
            // this.stopCameraAndClearInterval();
            clearInterval(this.scanInterval);
            const message = `Expiration date detected: ${expirationDate}`;
            this.toastService.showSuccess(message, true);
          }
        });
      })
      .catch((err) => console.error('OCR API Error:', err));
  }

  async runOcrLocally(frameData: string) {
    const worker = await Tesseract.createWorker('eng', undefined);
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789/.|\\ ',
    });
    const result = await worker.recognize(frameData);
    console.log('Recognized result:', result);
    console.log('Recognized text:', result.data.text);
    const expDate = this.extractExpirationDate(result.data.text);
    console.log('Expiration Date:', expDate);
    await worker.terminate();
    return;
    // initial implementation
    Tesseract.recognize(frameData, 'eng')
      .then((result) => {
        const text = result.data.text;
        console.log('Detected Text:', text);

        const expirationDate = this.extractExpirationDate(text);
        if (expirationDate) {
          console.log('Expiration Date Detected:', expirationDate);
          this.stopCameraAndClearInterval();
        }
      })
      .catch((err) => console.error('OCR Error:', err));
  }

  async runFreeOcrApi(frameData: string) {
    const formData = new FormData();
    formData.append('base64image', frameData);
    formData.append('language', 'eng');
    formData.append('OCREngine', '2');
    formData.append('scale', 'true');

    try {
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          apikey: environment.ocrApiKey,
        },
        body: formData,
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('OCR API Error:', error);
    }
  }

  extractExpirationDate(text: string): string | undefined {
    // Implement a simple regex or logic to extract expiration date from the OCR text
    // const datePattern = '\\d{2}[\\.\\/\\|]\\d{2}[\\.\\/\\|]\\d{4}';
    console.log('Text:', text);
    const datePattern = '\\d{2}.\\d{2}.\\d{4}';
    const match = text.match(datePattern);
    console.log('Match:', match);
    return match ? match[0] : undefined;
  }

  stopCameraAndClearInterval() {
    clearInterval(this.scanInterval);
    if (!this.stream) return;
    this.stream.getTracks().forEach((track: any) => track.stop());
  }

  ngOnDestroy() {
    this.stopCameraAndClearInterval();
  }

  preprocessImage(
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    this.makeGrayscale(imageData);
    this.adjustContrast(imageData, 100);
    // this.applyThreshold(imageData, 128);
    context.putImageData(imageData, 0, 0);
  }

  makeGrayscale(imageData: ImageData): ImageData {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Convert the image to grayscale
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // Red
      data[i + 1] = avg; // Green
      data[i + 2] = avg; // Blue
      // Optionally, you could increase brightness/contrast here as well
    }

    return imageData;
  }

  adjustContrast(imageData: ImageData, contrastFactor: number): ImageData {
    const data = imageData.data;
    const factor =
      (259 * (contrastFactor + 255)) / (255 * (259 - contrastFactor));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = factor * (data[i] - 128) + 128; // Red
      data[i + 1] = factor * (data[i + 1] - 128) + 128; // Green
      data[i + 2] = factor * (data[i + 2] - 128) + 128; // Blue
    }
    return imageData;
  }

  applyThreshold(imageData: ImageData, threshold: number): ImageData {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const brightness =
        0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
      const value = brightness >= threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = value; // Set red, green, blue channels
    }

    return imageData;
  }
}
