import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs/promises"

const execPromise = promisify(exec)

export async function POST(req: Request) {
  const { username, password, examUrl, requiresLogin } = await req.json()

  if (!examUrl) {
    return NextResponse.json({ error: "URL da Prova é obrigatória." }, { status: 400 })
  }

  if (requiresLogin && (!username || !password)) {
    return NextResponse.json({ error: "Usuário e Senha são obrigatórios para login." }, { status: 400 })
  }

  const dataDir = path.join(process.cwd(), "data")
  const htmlFilePath = path.join(dataDir, "downloaded_page.html")

  // URL de login fixa para o Studeo (usada apenas se requiresLogin for true)
  const studeoLoginUrl = "https://studeo.unicesumar.edu.br/#!/access/login"

  try {
    await fs.mkdir(dataDir, { recursive: true })

    console.log(`[API - fetch-html] Iniciando download do HTML de: ${examUrl}`)
    // Passa as credenciais, URLs e a flag requiresLogin como argumentos para o script Python
    const { stdout: fetchStdout, stderr: fetchStderr } = await execPromise(
      `python ${path.join(process.cwd(), "scripts", "fetch_html.py")} "${username || "None"}" "${password || "None"}" "${studeoLoginUrl}" "${examUrl}" "${htmlFilePath}" "${requiresLogin}"`,
    )
    if (fetchStderr) console.error(`[fetch_html.py ERROR] ${fetchStderr}`)
    console.log(`[API - fetch-html] fetch_html.py stdout: ${fetchStdout}`)

    return NextResponse.json({ message: "HTML baixado com sucesso!" })
  } catch (error: any) {
    console.error(`[API ERROR - fetch-html] ${error.message}`)
    return NextResponse.json({ error: `Erro ao baixar HTML: ${error.message}` }, { status: 500 })
  }
}
