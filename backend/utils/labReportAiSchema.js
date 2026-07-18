import { Type } from '@google/genai'
import { z } from 'zod'

// Tells Gemini exactly what JSON shape to return. This constrains
// generation server-side on Google's end — the model literally cannot
// emit a response that violates this structure.
export const geminiResponseSchema = {
  type: Type.OBJECT,
  properties: {
    biomarkers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER },
          unit: { type: Type.STRING, nullable: true },
          refLow: { type: Type.NUMBER, nullable: true },
          refHigh: { type: Type.NUMBER, nullable: true },
          category: { type: Type.STRING, nullable: true },
        },
        required: ['name', 'value'],
      },
    },
    aiSummary: { type: Type.STRING },
    riskTags: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['biomarkers', 'aiSummary', 'riskTags', 'recommendedActions'],
}

// Our own independent check, run in application code AFTER Gemini
// responds — this is what actually decides whether the data is trusted
// enough to write to Postgres, regardless of what Gemini's own schema
// enforcement claims to guarantee.
export const labReportAiResultSchema = z.object({
  biomarkers: z.array(z.object({
    name: z.string().min(1),
    value: z.number(),
    unit: z.string().nullable().optional(),
    refLow: z.number().nullable().optional(),
    refHigh: z.number().nullable().optional(),
    category: z.string().nullable().optional(),
  })),
  aiSummary: z.string().min(1),
  riskTags: z.array(z.string()),
  recommendedActions: z.array(z.string()),
})

// The actual prompt. Written specifically around what real extracted
// PDF text looks like (repeated boilerplate per page, tab-separated
// fragments, mixed data/explanation text) — not a generic "parse this"
// instruction.
export const buildLabReportPrompt = (rawText) => `
You are a clinical data extraction engine. You will be given raw text extracted from a multi-page lab report PDF. This text is messy: it often repeats the same boilerplate (signatures, QR code references, page headers/footers, patient demographic blocks) on every page, and test results appear mixed in with long explanatory paragraphs about what each test means.

Your task:
1. Extract ONLY the actual measured lab test results — each one has a test name, a numeric value, a unit, and typically a reference range.
2. Deduplicate: if the same test name appears more than once (common due to repeated page footers), include it only ONCE, using its actual measured value.
3. IGNORE: signatures, doctor names, page numbers, QR code mentions, "This is an Electronically Authenticated Report" boilerplate, sample collection metadata, and long explanatory/educational paragraphs about what a test means clinically — unless that explanation directly states the patient's actual result.
4. For reference ranges written as "70 - 100", set refLow=70 and refHigh=100. For ranges written as "<200", set refLow=null and refHigh=200. For ranges written as ">4", set refLow=4 and refHigh=null. If no numeric range is given at all, set both to null.
5. Assign each biomarker a short category: Hematology, Metabolic, Lipid, Renal, Liver, Thyroid, Vitamin, Immunology, Urinalysis, or Other.
6. Do NOT invent values that are not present in the text.
7. Write a 3-5 sentence clinical executive summary of the overall findings, written the way a physician would summarize a chart before a consultation.
8. List 2-5 short riskTags (e.g. "Hyperglycemia — High", "Vitamin B12 Deficiency") based only on genuinely abnormal results.
9. List 2-4 recommendedActions — concrete, concise next steps a physician might take (e.g. "Order iron studies to characterize anemia").

Raw extracted text:
"""
${rawText}
"""
`