import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs/promises"

const execPromise = promisify(exec)

export async function POST(req: Request) {
  const { apiKey } = await req.json()

  if (!apiKey) {
    return NextResponse.json({ error: "Chave de API é obrigatória." }, { status: 400 })
  }

  const dataDir = path.join(process.cwd(), "data")
  const questionsFilePath = path.join(dataDir, "extracted_questions.txt")
  const answersFilePath = path.join(dataDir, "ai_answers.txt")

  try {
    // Verifica se o arquivo de questões existe antes de tentar resolver
    try {
      await fs.access(questionsFilePath)
    } catch (e) {
      return NextResponse.json(
        { error: "Arquivo de questões não encontrado. Por favor, extraia as questões primeiro." },
        { status: 400 },
      )
    }

    console.log(`[API - resolve-questions] Resolvendo questões com IA de: ${questionsFilePath}`)
    // Passa a API Key diretamente para o script Python
    const { stdout: resolveStdout, stderr: resolveStderr } = await execPromise(
      `python ${path.join(process.cwd(), "scripts", "resolve_questions.py")} "${questionsFilePath}" "${answersFilePath}" "${apiKey}"`,
    )
    if (resolveStderr) console.error(`[resolve_questions.py ERROR] ${resolveStderr}`)
    console.log(`[API - resolve-questions] resolve_questions.py stdout: ${resolveStdout}`)

    // Ler as respostas geradas
    const answersContent = await fs.readFile(answersFilePath, "utf-8")

    return NextResponse.json({ message: "Questões resolvidas com sucesso!", answers: answersContent })
  } catch (error: any) {
    console.error(`[API ERROR - resolve-questions] ${error.message}`)
    return NextResponse.json({ error: `Erro ao resolver questões com IA: ${error.message}` }, { status: 500 })
  }
}
