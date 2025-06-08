import './style.css'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api'

// Set worker path to local copy
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

const fileInputEl = document.getElementById("file-input") as HTMLInputElement | null
const jsonDisplayEl = document.getElementById("json-display") as HTMLTextAreaElement | null

type PdfFieldData = Record<string, string>

const getCharData = async (pdf: PDFDocumentProxy): Promise<PdfFieldData> => {
  const output: PdfFieldData = {}

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum)
      const annotations = await page.getAnnotations()

      annotations.forEach((annotation) => {
        if (annotation.fieldName && annotation.fieldValue) {
          output[annotation.fieldName] = annotation.fieldValue
        }
      })
    } catch (error) {
      console.warn(`Error processing page ${pageNum}:`, error)
    }
  }

  console.log('Extracted PDF data:', output)
  return output
}

if (fileInputEl && jsonDisplayEl) {
  fileInputEl.addEventListener('change', async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
      jsonDisplayEl.value = JSON.stringify(await getCharData(pdf), null, 2)
    } catch (error) {
      console.error("PDF processing error:", error)
      if (jsonDisplayEl) {
        jsonDisplayEl.value = `Error processing PDF: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  })
}