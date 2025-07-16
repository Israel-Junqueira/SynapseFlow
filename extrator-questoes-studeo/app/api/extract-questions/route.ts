import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs/promises"

const execPromise = promisify(exec)

export async function POST(req: Request) {
  const dataDir = path.join(process.cwd(), "data")
  const htmlFilePath = path.join(dataDir, "downloaded_page.html")
  const questionsFilePath = path.join(dataDir, "extracted_questions.txt")

  try {
    // Verifica se o arquivo HTML existe antes de tentar extrair
    try {
      await fs.access(htmlFilePath)
    } catch (e) {
      return NextResponse.json(
        { error: "Arquivo HTML não encontrado. Por favor, baixe o HTML primeiro." },
        { status: 400 },
      )
    }

    console.log(`[API - extract-questions] Extraindo questões de: ${htmlFilePath}`)
    const { stdout: extractStdout, stderr: extractStderr } = await execPromise(
      `python ${path.join(process.cwd(), "scripts", "extract_questions.py")} "${htmlFilePath}" "${questionsFilePath}"`,
    )
    if (extractStderr) console.error(`[extract_questions.py ERROR] ${extractStderr}`)
    console.log(`[API - extract-questions] extract_questions.py stdout: ${extractStdout}`)

    // Verifica se o arquivo de questões foi realmente criado e tem conteúdo
    const extractedContent = await fs.readFile(questionsFilePath, "utf-8")
    if (!extractedContent || extractedContent.trim().length < 100) {
      // Um valor arbitrário para verificar se não está vazio
      throw new Error(
        "Nenhuma questão foi extraída ou o arquivo de questões está vazio. Verifique o HTML ou a lógica de extração.",
      )
    }

    return NextResponse.json({ message: "Questões extraídas com sucesso!" })
  } catch (error: any) {
    console.error(`[API ERROR - extract-questions] ${error.message}`)
    return NextResponse.json({ error: `Erro ao extrair questões: ${error.message}` }, { status: 500 })
  }
}
