import db from '../db';
import { createFraudFlag } from './fraud.service';

const GROQ_MODEL = 'meta-llama/llama-4-maverick-17b-128e-instruct';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export interface ValidationInput {
  question: string;
  referenceAnswer: string;
  studentAnswer: string;
  context?: string;
}

export interface ValidationResult {
  ai_detection_score: number;
  relevance_score: number;
  quality_score: number;
  plagiarism_indicators: string[];
  feedback: string;
}

// Simple queue to rate-limit Groq calls (max 1/second)
const MAX_QUEUE_SIZE = 100;
const queue: (() => Promise<void>)[] = [];
let processing = false;

async function processQueue(): Promise<void> {
  if (processing) return;
  processing = true;
  while (queue.length > 0) {
    const task = queue.shift()!;
    try {
      await task();
    } catch (e) {
      console.error('[ai-validation] Queue task error:', e);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  processing = false;
}

export async function validateAnswer(input: ValidationInput): Promise<ValidationResult | null> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    console.warn('[ai-validation] GROQ_API_KEY not configured, skipping validation');
    return null;
  }

  const systemPrompt = `Anda adalah sistem evaluasi akademik untuk mata kuliah Pengujian Keamanan Informasi.
Analisis jawaban mahasiswa berdasarkan:
1. Deteksi AI (ai_detection_score): 0.0 = ditulis manusia, 1.0 = kemungkinan besar dihasilkan AI
2. Relevansi (relevance_score): 0.0 = tidak relevan, 1.0 = sangat relevan dengan pertanyaan
3. Kualitas (quality_score): 0.0 = kualitas buruk, 1.0 = kualitas sangat baik
4. Indikator plagiarisme: daftar indikator yang mencurigakan (array kosong jika tidak ada)
5. Umpan balik: komentar singkat dalam Bahasa Indonesia

Berikan respons dalam format JSON:
{
  "ai_detection_score": number,
  "relevance_score": number,
  "quality_score": number,
  "plagiarism_indicators": string[],
  "feedback": string
}`;

  const userMessage = `Pertanyaan: ${input.question}

Jawaban Referensi: ${input.referenceAnswer}

Jawaban Mahasiswa: ${input.studentAnswer}

${input.context ? `Konteks: ${input.context}` : ''}

Analisis jawaban mahasiswa di atas.`;

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 512,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('[ai-validation] Groq API error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const result = JSON.parse(content) as ValidationResult;

    // Clamp scores to [0, 1]
    result.ai_detection_score = Math.max(0, Math.min(1, result.ai_detection_score || 0));
    result.relevance_score = Math.max(0, Math.min(1, result.relevance_score || 0));
    result.quality_score = Math.max(0, Math.min(1, result.quality_score || 0));
    result.plagiarism_indicators = Array.isArray(result.plagiarism_indicators) ? result.plagiarism_indicators : [];
    result.feedback = result.feedback || '';

    return result;
  } catch (e) {
    console.error('[ai-validation] Error:', e);
    return null;
  }
}

export function enqueueValidation(params: {
  tenant_id?: number;
  submission_type: 'quiz' | 'case_study';
  submission_id: number;
  question_id: number;
  student_id: string;
  module_id: number;
  question: string;
  referenceAnswer: string;
  studentAnswer: string;
}): void {
  if (queue.length >= MAX_QUEUE_SIZE) {
    console.warn('[ai-validation] Queue full, dropping validation request for', params.student_id);
    return;
  }

  queue.push(async () => {
    const result = await validateAnswer({
      question: params.question,
      referenceAnswer: params.referenceAnswer,
      studentAnswer: params.studentAnswer,
    });

    if (!result) return;

    try {
      db.prepare(`
        INSERT INTO ai_validations (tenant_id, submission_type, submission_id, question_id, student_id, module_id, ai_detection_score, relevance_score, quality_score, plagiarism_indicators, ai_feedback, raw_response)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        params.tenant_id ?? 1,
        params.submission_type,
        params.submission_id,
        params.question_id,
        params.student_id,
        params.module_id,
        result.ai_detection_score,
        result.relevance_score,
        result.quality_score,
        JSON.stringify(result.plagiarism_indicators),
        result.feedback,
        JSON.stringify(result),
      );

      // Auto-flag if AI detection score is high
      if (result.ai_detection_score > 0.7) {
        createFraudFlag({
          tenant_id: params.tenant_id,
          user_id: params.student_id,
          flag_type: 'ai_detected',
          severity: result.ai_detection_score > 0.9 ? 'critical' : 'high',
          resource_type: params.submission_type === 'quiz' ? 'quiz_attempt' : 'case_study_submission',
          resource_id: String(params.submission_id),
          details: {
            ai_detection_score: result.ai_detection_score,
            question_id: params.question_id,
            feedback: result.feedback,
          },
        });
      }
    } catch (e) {
      console.error('[ai-validation] DB insert error:', e);
    }
  });

  processQueue();
}
