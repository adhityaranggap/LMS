import * as faceapi from '@vladmandic/face-api';
import { Canvas, Image, createCanvas, loadImage } from 'canvas';
import path from 'path';

// Patch face-api to use node-canvas
faceapi.env.monkeyPatch({ Canvas, Image } as any);

// Constants
export const FACE_MATCH_THRESHOLD = 0.6;
export const FACE_WARN_THRESHOLD = 0.7;
const MIN_DETECTION_CONFIDENCE = 0.5;

let modelsLoaded = false;

export async function initFaceService(): Promise<void> {
  if (modelsLoaded) return;

  const modelPath = path.join(
    process.cwd(),
    'node_modules',
    '@vladmandic',
    'face-api',
    'model',
  );

  console.log('[face-service] Loading face detection models...');
  const t0 = Date.now();

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);

  modelsLoaded = true;
  console.log(`[face-service] Models loaded in ${Date.now() - t0}ms`);
}

export function isModelReady(): boolean {
  return modelsLoaded;
}

function base64ToBuffer(base64: string): Buffer {
  let data = base64;
  const commaIdx = data.indexOf(',');
  if (commaIdx >= 0) {
    data = data.slice(commaIdx + 1);
  }
  return Buffer.from(data, 'base64');
}

export interface FaceExtractionResult {
  descriptor: number[];
  confidence: number;
}

export async function extractFaceDescriptor(
  base64Photo: string,
): Promise<FaceExtractionResult> {
  if (!modelsLoaded) {
    throw new Error('MODEL_NOT_READY');
  }

  const buf = base64ToBuffer(base64Photo);
  const img = await loadImage(buf);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img as any, 0, 0);

  const detections = await faceapi
    .detectAllFaces(canvas as any, new faceapi.SsdMobilenetv1Options({ minConfidence: MIN_DETECTION_CONFIDENCE }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (detections.length === 0) {
    throw new Error('NO_FACE_DETECTED');
  }
  if (detections.length > 1) {
    throw new Error('MULTIPLE_FACES_DETECTED');
  }

  const detection = detections[0];
  const confidence = detection.detection.score;

  if (confidence < MIN_DETECTION_CONFIDENCE) {
    throw new Error('LOW_CONFIDENCE');
  }

  return {
    descriptor: Array.from(detection.descriptor),
    confidence,
  };
}

export function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function compareFaces(
  query: number[],
  storedDescriptors: number[][],
): { minDistance: number; matched: boolean; marginal: boolean } {
  let minDistance = Infinity;

  for (const stored of storedDescriptors) {
    const dist = euclideanDistance(query, stored);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return {
    minDistance,
    matched: minDistance <= FACE_MATCH_THRESHOLD,
    marginal: minDistance > FACE_MATCH_THRESHOLD && minDistance <= FACE_WARN_THRESHOLD,
  };
}
