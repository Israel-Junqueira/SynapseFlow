import google.generativeai as genai
import re
from api_config import GOOGLE_API_KEY
import requests # Adicione esta linha

def _carregar_questoes_do_arquivo(filename='questoes_formatadas.txt'):
    """
    Carrega as questões e suas alternativas do arquivo formatado.
    """
    questoes = []
    current_questao = None
    
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            lines = file.readlines()
        
        for line in lines:
            line = line.strip()
            if line.startswith("QUESTÃO"):
                if current_questao:
                    questoes.append(current_questao)
                current_questao = {'alternativas': []}
                match = re.match(r"QUESTÃO\s*(\d+)", line)
                if match:
                    current_questao['numero'] = int(match.group(1))
            elif line.startswith("ALTERNATIVAS:"):
                pass # Próximas linhas serão alternativas
            elif current_questao and re.match(r"^[A-E]\)\s*\[[X ]\]\s*(.*)", line):
                # Extrai a letra e o texto da alternativa
                match = re.match(r"^([A-E])\)\s*\[[X ]\]\s*(.*)", line)
                if match:
                    current_questao['alternativas'].append(match.group(2).strip())
            elif current_questao and line and not line.startswith("=") and not line.startswith("-"):
                # Captura o enunciado (linhas entre QUESTÃO e ALTERNATIVAS)
                if 'enunciado' not in current_questao:
                    current_questao['enunciado'] = line
                else:
                    current_questao['enunciado'] += " " + line # Concatena se for multi-linha
        
        if current_questao: # Adiciona a última questão
            questoes.append(current_questao)
            
    except FileNotFoundError:
        print(f"❌ Erro: Arquivo '{filename}' não encontrado.")
        return []
    except Exception as e:
        print(f"❌ Erro ao carregar questões do arquivo: {e}")
        return []
            
    return questoes

def enviar_respostas_para_url(url, respostas_ia_formatadas):
    """
    Envia as respostas da IA para uma URL via requisição POST.
    """
    print(f"\n📤 Tentando enviar respostas para a URL: {url}...")
    
    dados_para_enviar = []
    for num_questao, resposta_completa in respostas_ia_formatadas.items():
        match = re.match(r"([A-E])\)\s*\[X\]\s*(.*)", resposta_completa)
        if match:
            letra_alternativa = match.group(1)
            texto_alternativa = match.group(2).strip()
        else:
            letra_alternativa = "N/A"
            texto_alternativa = resposta_completa 

        dados_para_enviar.append({
            'question_number': num_questao,
            'selected_alternative_letter': letra_alternativa,
            'selected_alternative_text': texto_alternativa
        })

    try:
        # Enviando como JSON. Este é o formato mais comum para APIs.
        # Se o seu formulário espera outro formato (ex: form-urlencoded),
        # isso precisaria ser ajustado.
        response = requests.post(url, json={'answers': dados_para_enviar})
        response.raise_for_status() # Levanta um erro para códigos de status HTTP ruins (4xx ou 5xx)
        
        print(f"✅ Respostas enviadas com sucesso! Status: {response.status_code}")
        print(f"Resposta do servidor (primeiros 200 caracteres): {response.text[:200]}...")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao enviar respostas para a URL: {e}")
        print("Isso pode acontecer se a URL não for um endpoint de submissão de formulário válido,")
        print("ou se o servidor espera um formato de dados diferente, ou se há problemas de autenticação.")
        print(f"Detalhes do erro: {e}")

def resolver_questoes_com_api():
    """
    Lê as questões formatadas, envia para a API do Google AI e salva as respostas.
    """
    
    api_key = GOOGLE_API_KEY
    
    if not api_key or api_key == "sua_chave_gemini_aqui":
        print("❌ Erro: Chave GOOGLE_API_KEY não configurada ou ainda é o valor padrão.")
        print("Por favor, edite o arquivo 'api_config.py' e insira sua chave real do Google AI.")
        return
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    print("📋 Carregando questões originais para referência...")
    questoes_originais = _carregar_questoes_do_arquivo('questoes_formatadas.txt')
    if not questoes_originais:
        print("Não foi possível carregar as questões originais. Abortando.")
        return
    
    try:
        with open('questoes_formatadas.txt', 'r', encoding='utf-8') as file:
            questoes_content = file.read()
    except FileNotFoundError:
        print("❌ Erro: Arquivo 'questoes_formatadas.txt' não encontrado.")
        print("Certifique-se de ter executado 'python scripts/extrair_questoes_melhorado.py' primeiro.")
        return
    
    prompt_para_ia = f"""Você é um assistente inteligente e preciso, capaz de analisar e responder a questões de múltipla escolha sobre diversos tópicos.

Analise cada questão cuidadosamente e responda APENAS com a LETRA da alternativa correta.

FORMATO DE RESPOSTA OBRIGATÓRIO:
QUESTÃO 1: A
QUESTÃO 2: B
QUESTÃO 3: C
... (e assim por diante para todas as questões)

INSTRUÇÕES:
- Leia atentamente cada enunciado.
- Analise todas as alternativas fornecidas.
- Escolha a alternativa mais precisa e correta.
- Responda apenas com a letra correspondente à alternativa (A, B, C, D ou E).
- Não inclua explicações, apenas a resposta no formato solicitado.

QUESTÕES PARA RESOLVER:
{questoes_content}

LEMBRE-SE: Responda apenas no formato:
QUESTÃO 1: [LETRA]
QUESTÃO 2: [LETRA]
...
"""
    
    print("🚀 Enviando questões para o Google AI (Gemini API)...")
    try:
        response = model.generate_content(prompt_para_ia)
        
        ia_response_text = response.text
        print("✅ Resposta da IA recebida!")
        
        respostas_extraidas = {}
        matches = re.findall(r"QUESTÃO\s*(\d+):\s*([A-E])", ia_response_text, re.IGNORECASE)
        
        for match in matches:
            num_questao = int(match[0])
            resposta_letra = match[1].upper()
            
            questao_encontrada = next((q for q in questoes_originais if q['numero'] == num_questao), None)
            
            if questao_encontrada:
                alt_index = ord(resposta_letra) - ord('A')
                
                if 0 <= alt_index < len(questao_encontrada['alternativas']):
                    alternativa_completa = questao_encontrada['alternativas'][alt_index]
                    respostas_extraidas[num_questao] = f"{resposta_letra}) [X] {alternativa_completa}"
                else:
                    respostas_extraidas[num_questao] = f"{resposta_letra}) [X] Alternativa não encontrada (índice inválido)"
            else:
                respostas_extraidas[num_questao] = f"{resposta_letra}) [X] Questão original não encontrada"
                
        output_filename = 'respostas_ia.txt'
        with open(output_filename, 'w', encoding='utf-8') as outfile:
            for num, resp in sorted(respostas_extraidas.items()):
                outfile.write(f"QUESTÃO {num}: {resp}\n")
        
        print(f"✅ Respostas da IA salvas em: {output_filename}")
        print("\n📋 PREVIEW DAS RESPOSTAS DA IA:")
        for num, resp in sorted(respostas_extraidas.items())[:5]:
            print(f"QUESTÃO {num}: {resp}")
        if len(respostas_extraidas) > 5:
            print(f"... e mais {len(respostas_extraidas) - 5} respostas.")

        # --- NOVA PARTE: Solicitar URL e enviar ---
        form_url = input("\n👉 Por favor, cole a URL para onde deseja enviar as respostas e pressione Enter: ")
        if form_url:
            enviar_respostas_para_url(form_url, respostas_extraidas)
        else:
            print("⚠️ Nenhuma URL fornecida. As respostas não foram enviadas.")
        # --- FIM DA NOVA PARTE ---

    except Exception as e:
        print(f"❌ Erro ao chamar a API do Google AI: {e}")
        print("Verifique sua chave de API, o modelo selecionado e sua conexão com a internet.")
        print(f"Detalhes do erro: {e}")

def main():
    print("🤖 RESOLVEDOR DE QUESTÕES COM GOOGLE AI (GEMINI API)")
    print("=" * 55)
    resolver_questoes_com_api()

if __name__ == "__main__":
    main()
