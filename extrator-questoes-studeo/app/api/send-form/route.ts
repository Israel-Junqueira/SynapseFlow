import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs/promises"

const execPromise = promisify(exec)

export async function POST(req: Request) {
  const { url, answers } = await req.json()

  if (!url) {
    return NextResponse.json({ error: "URL do formulário é obrigatória." }, { status: 400 })
  }
  if (!answers) {
    return NextResponse.json({ error: "Nenhuma resposta para enviar." }, { status: 400 })
  }

  const answersToSendPath = path.join(process.cwd(), "data", "answers_to_send.json")

  try {
    await fs.writeFile(answersToSendPath, JSON.stringify({ answers: answers }))

    console.log(`[API] Enviando respostas para o formulário em: ${url}`)
    const { stdout, stderr } = await execPromise(
      `python ${path.join(process.cwd(), "scripts", "send_form_answers.py")} "${url}" "${answersToSendPath}"`,
    )
    if (stderr) console.error(`[send_form_answers.py ERROR] ${stderr}`)
    console.log(`[API] send_form_answers.py stdout: ${stdout}`)

    return NextResponse.json({ message: "Respostas enviadas para o formulário com sucesso!" })
  } catch (error: any) {
    console.error(`[API ERROR - Send Form] ${error.message}`)
    return NextResponse.json({ error: `Erro ao enviar respostas para o formulário: ${error.message}` }, { status: 500 })
  } finally {
    try {
      await fs.unlink(answersToSendPath)
    } catch (e) {
      // Ignora erro se o arquivo já não existir
    }
  }
}
