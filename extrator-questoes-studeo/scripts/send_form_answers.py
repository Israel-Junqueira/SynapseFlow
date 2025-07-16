import requests
import sys
import json
import re # Importar regex para parsear as respostas

def send_form_answers(url, answers_json_filepath):
    """
    Lê as respostas de um arquivo JSON e as envia para uma URL via requisição POST.
    """
    try:
        with open(answers_json_filepath, 'r', encoding='utf-8') as f:
            data_from_api_route = json.load(f)
        
        # O 'answers' do JSON é uma string que contém as respostas formatadas.
        # Ex: "QUESTÃO 1: A) [X] Texto da alternativa 1\nQUESTÃO 2: B) [X] Texto da alternativa 2"
        answers_text = data_from_api_route.get('answers', '')
        
        # Vamos parsear essa string para um formato mais adequado para um formulário.
        # Ex: {'question_1': 'Texto da alternativa 1', 'question_2': 'Texto da alternativa 2'}
        
        parsed_answers_for_form = {}
        lines = answers_text.strip().split('\n')
        for line in lines:
            # Regex para extrair o número da questão e o texto da alternativa
            match = re.match(r"QUESTÃO\s*(\d+):\s*[A-E]\)\s*\[X\]\s*(.*)", line)
            if match:
                num_questao = int(match.group(1))
                texto_alternativa = match.group(2).strip()
                # Usando um formato genérico 'question_N' para o nome do campo
                parsed_answers_for_form[f'question_{num_questao}'] = texto_alternativa
            
        print(f"Enviando respostas para a URL: {url}")
        
        # Enviando como JSON.
        # Se o seu formulário espera 'form-urlencoded', mude 'json=' para 'data='
        # e certifique-se que 'parsed_answers_for_form' é um dicionário simples.
        response = requests.post(url, json=parsed_answers_for_form, timeout=30)
        response.raise_for_status() # Levanta um erro para códigos de status HTTP ruins (4xx ou 5xx)
        
        print(f"Respostas enviadas com sucesso! Status: {response.status_code}")
        print(f"Resposta do servidor (primeiros 200 caracteres): {response.text[:200]}...")
        sys.exit(0) # Sucesso
    except FileNotFoundError:
        print(f"Erro: Arquivo de respostas '{answers_json_filepath}' nao encontrado.", file=sys.stderr)
        sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"Erro ao enviar respostas para a URL: {e}", file=sys.stderr)
        print("Verifique a URL, sua conexao com a internet e se o servidor esta configurado para receber os dados.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Erro inesperado em send_form_answers: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python send_form_answers.py <url> <answers_json_filepath>", file=sys.stderr)
        sys.exit(1)
    
    url_to_send = sys.argv[1]
    answers_file = sys.argv[2]
    send_form_answers(url_to_send, answers_file)
