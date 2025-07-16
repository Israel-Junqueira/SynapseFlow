import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs/promises"

const execPromise = promisify(exec)

export async function POST(req: Request) {
  const { username, password, examUrl, apiKey } = await req.json()

  if (!username || !password || !examUrl) {
    return NextResponse.json({ error: "Usuário, Senha e URL da Prova são obrigatórios." }, { status: 400 })
  }
  if (!apiKey) {
    return NextResponse.json({ error: "Chave de API é obrigatória." }, { status: 400 })
  }

  const dataDir = path.join(process.cwd(), "data")
  const htmlFilePath = path.join(dataDir, "downloaded_page.html")
  const questionsFilePath = path.join(dataDir, "extracted_questions.txt")
  const answersFilePath = path.join(dataDir, "ai_answers.txt")
  const apiConfigPath = path.join(process.cwd(), "scripts", "api_config.py")

  // URL de login fixa para o Studeo
  const studeoLoginUrl = "https://studeo.unicesumar.edu.br/#!/access/login"

  let originalApiConfigContent: string

  try {
    await fs.mkdir(dataDir, { recursive: true })

    // Temporariamente sobrescreve a chave da API no api_config.py
    originalApiConfigContent = await fs.readFile(apiConfigPath, "utf-8")
    const newApiConfigContent = originalApiConfigContent.replace(
      /GOOGLE_API_KEY = ".*"/,
      `GOOGLE_API_KEY = "${apiKey}"`,
    )
    await fs.writeFile(apiConfigPath, newApiConfigContent)

    // 1. Baixar o HTML usando Selenium (com login)
    console.log(`[API] Iniciando login e download do HTML de: ${examUrl}`)
    // Passa as credenciais e URLs como argumentos para o script Python
    const { stdout: fetchStdout, stderr: fetchStderr } = await execPromise(
      `python ${path.join(process.cwd(), "scripts", "fetch_html.py")} "${username}" "${password}" "${studeoLoginUrl}" "${examUrl}" "${htmlFilePath}"`,
    )
    if (fetchStderr) console.error(`[fetch_html.py ERROR] ${fetchStderr}`)
    console.log(`[API] fetch_html.py stdout: ${fetchStdout}`)

    // 2. Extrair as questões
    console.log(`[API] Extraindo questões de: ${htmlFilePath}`)
    const { stdout: extractStdout, stderr: extractStderr } = await execPromise(
      `python ${path.join(process.cwd(), "scripts", "extract_questions.py")} "${htmlFilePath}" "${questionsFilePath}"`,
    )
    if (extractStderr) console.error(`[extract_questions.py ERROR] ${extractStderr}`)
    console.log(`[API] extract_questions.py stdout: ${extractStdout}`)

    // 3. Resolver as questões com a IA
    console.log(`[API] Resolvendo questões com IA de: ${questionsFilePath}`)
    const { stdout: resolveStdout, stderr: resolveStderr } = await execPromise(
      `python ${path.join(process.cwd(), "scripts", "resolve_questions.py")} "${questionsFilePath}" "${answersFilePath}"`,
    )
    if (resolveStderr) console.error(`[resolve_questions.py ERROR] ${resolveStderr}`)
    console.log(`[API] resolve_questions.py stdout: ${resolveStdout}`)

    // Ler as respostas geradas
    const answersContent = await fs.readFile(answersFilePath, "utf-8")

    // Restaurar o api_config.py original
    await fs.writeFile(apiConfigPath, originalApiConfigContent)

    return NextResponse.json({ message: "Processamento concluído!", answers: answersContent })
  } catch (error: any) {
    // Restaurar o api_config.py em caso de erro também
    try {
      if (originalApiConfigContent) {
        await fs.writeFile(apiConfigPath, originalApiConfigContent)
      }
    } catch (restoreError) {
      console.error(`Erro ao restaurar api_config.py: ${restoreError}`)
    }
    console.error(`[API ERROR] ${error.message}`)
    return NextResponse.json({ error: `Erro no processamento: ${error.message}` }, { status: 500 })
  }
}
