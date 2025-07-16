import requests
import re
import sys
import os

def _carregar_questoes_do_arquivo(filename):
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
                pass
            elif current_questao and re.match(r"^[A-E]\)\s*\[[X ]\]\s*(.*)", line):
                match = re.match(r"^([A-E])\)\s*\[[X ]\]\s*(.*)", line)
                if match:
                    current_questao['alternativas'].append(match.group(2).strip())
            elif current_questao and line and not line.startswith("=") and not line.startswith("-"):
                if 'enunciado' not in current_questao:
                    current_questao['enunciado'] = line
                else:
                    current_questao['enunciado'] += " " + line
        
        if current_questao:
            questoes.append(current_questao)
            
    except FileNotFoundError:
        print(f"Erro: Arquivo '{filename}' nao encontrado.", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Erro ao carregar questoes do arquivo: {e}", file=sys.stderr)
        return []
            
    return questoes

def resolve_questions_with_ai(input_questions_filepath, output_answers_filepath, api_key):
    """
    Lê as questões formatadas, envia para a API do Groq e salva as respostas.
    Recebe a api_key como argumento.
    """
    if not api_key or api_key == "gsk_sua_chave_aqui": # Atualizado para Groq
        print("Erro: Chave Groq API Key nao configurada ou ainda e o valor padrao.", file=sys.stderr)
        sys.exit(1)

    # Configuração da API do Groq
    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    # Modelo Groq (Llama 3 8B é rápido e bom para esta tarefa)
    MODEL_NAME = "llama3-8b-8192" 

    print("Carregando questoes originais para referencia...")
    questoes_originais = _carregar_questoes_do_arquivo(input_questions_filepath)
    if not questoes_originais:
        print("Nao foi possivel carregar as questoes originais. Abortando.", file=sys.stderr)
        sys.exit(1)

    try:
        with open(input_questions_filepath, 'r', encoding='utf-8') as file:
            questoes_content = file.read()
    except FileNotFoundError:
        print(f"Erro: Arquivo '{input_questions_filepath}' nao encontrado.", file=sys.stderr)
        sys.exit(1)

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
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt_para_ia}
        ],
        "temperature": 0.1, # Para respostas mais determinísticas
        "max_tokens": 500, # Ajuste conforme necessário
    }

    print(f"Enviando questoes para o Groq API ({MODEL_NAME})...")
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status() # Levanta um erro para códigos de status HTTP ruins (4xx ou 5xx)
        
        ia_response_json = response.json()
        # A resposta do Groq (OpenAI-compatible)
        ia_response_text = ia_response_json['choices'][0]['message']['content'] if ia_response_json and 'choices' in ia_response_json else ""

        if not ia_response_text:
            raise Exception("Resposta vazia ou inesperada da IA.")

        print("Resposta da IA recebida!")

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
                
        # Garante que o diretório de saída existe
        output_dir = os.path.dirname(output_answers_filepath)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        with open(output_answers_filepath, 'w', encoding='utf-8') as outfile:
            for num, resp in sorted(respostas_extraidas.items()):
                outfile.write(f"QUESTÃO {num}: {resp}\n")
        
        print(f"Respostas da IA salvas em: {output_answers_filepath}")
        sys.exit(0) # Sucesso

    except requests.exceptions.RequestException as e:
        print(f"Erro ao chamar a API do Groq: {e}", file=sys.stderr)
        print("Verifique sua chave de API, o modelo selecionado e sua conexao com a internet.", file=sys.stderr)
        print(f"Detalhes da resposta: {response.text if 'response' in locals() else 'N/A'}", file=sys.stderr)
        sys.exit(1) # Erro
    except Exception as e:
        print(f"Erro inesperado: {e}", file=sys.stderr)
        sys.exit(1) # Erro

if __name__ == "__main__":
    # Espera 3 argumentos: input_questions_filepath, output_answers_filepath, api_key
    if len(sys.argv) != 4:
        print("Uso: python resolve_questions.py <input_questions_filepath> <output_answers_filepath> <api_key>", file=sys.stderr)
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    api_key_arg = sys.argv[3] # Captura a API Key do argumento
    resolve_questions_with_ai(input_file, output_file, api_key_arg)
