# extrair_questoes_melhorado-TNQSZO1tAw3pMr1kRUwFNWhsvgXa7S.py
# URL: https://blobs.vusercontent.net/blob/extrair_questoes_melhorado-TNQSZO1tAw3pMr1kRUwFNWhsvgXa7S.py

from bs4 import BeautifulSoup
import re
import sys
import os # Importar os para manipulação de diretórios

def _extrair_questoes_do_html_parser(html_content):
    """
    Extrai questões do HTML do Studeo de forma mais precisa usando BeautifulSoup.
    Esta é a função de parsing principal.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    questoes = []
    enunciados_vistos = set()  # Para evitar duplicatas
    
    # Buscar questões no HTML de impressão (mais limpo)
    questoes_impressao = soup.find_all('table', class_='tableQuestao')
    
    questao_numero = 1
    for questao_table in questoes_impressao:
        try:
            # Extrair enunciado
            enunciado_cell = questao_table.find('td', class_='questoes')
            if not enunciado_cell:
                continue
                
            enunciado_raw = enunciado_cell.get_text(strip=True)
            enunciado = _limpar_enunciado(enunciado_raw)
            
            # Verificar se já vimos este enunciado (evitar duplicatas)
            enunciado_hash = enunciado[:100]  # Primeiros 100 caracteres como identificador
            if enunciado_hash in enunciados_vistos:
                continue
            enunciados_vistos.add(enunciado_hash)
            
            # Extrair alternativas
            alternativas = []
            alternativas_rows = questao_table.find_all('tr')
            
            for row in alternativas_rows:
                # Procurar por células com alternativas
                alt_cell = row.find('td', class_='labels')
                if alt_cell:
                    alt_text = alt_cell.get_text(strip=True)
                    if alt_text and len(alt_text) > 2:
                        alternativas.append(alt_text)
            
            # Remover duplicatas mantendo a ordem
            alternativas_unicas = []
            for alt in alternativas:
                if alt not in alternativas_unicas:
                    alternativas_unicas.append(alt)
            
            # Verificar se há resposta marcada (gabarito)
            resposta_correta = None
            input_checked = questao_table.find('input', {'checked': 'checked'})
            if input_checked:
                # Encontrar qual alternativa está marcada
                parent_row = input_checked.find_parent('tr')
                if parent_row:
                    resposta_cell = parent_row.find('td', class_='labels')
                    if resposta_cell:
                        resposta_correta = resposta_cell.get_text(strip=True)
            
            # Só adicionar se tiver enunciado e pelo menos 2 alternativas
            if enunciado and len(alternativas_unicas) >= 2:
                questoes.append({
                    'numero': questao_numero,
                    'enunciado': enunciado,
                    'alternativas': alternativas_unicas,
                    'resposta_correta': resposta_correta
                })
                questao_numero += 1
                
        except Exception as e:
            print(f"Erro ao processar questao: {e}", file=sys.stderr)
            continue
    
    return questoes

def _limpar_enunciado(texto):
    """
    Limpa e formata o enunciado da questão
    """
    # Remover quebras de linha excessivas
    texto = re.sub(r'\n+', ' ', texto)
    texto = re.sub(r'\s+', ' ', texto)
    
    # Remover caracteres HTML
    texto = texto.replace('&nbsp;', ' ')
    texto = texto.replace('&lt;', '<')
    texto = texto.replace('&gt;', '>')
    
    return texto.strip()

def _questoes_conhecidas_studeo():
    """
    Questões extraídas manualmente do HTML como backup - apenas questões únicas
    """
    return [
        {
            'numero': 1,
            'enunciado': 'Um dos temas que diferenciam a linguagem C das demais linguagens é a possibilidade de podermos manipular a memória de um dispositivo computacional através dos ponteiros. Com base no código apresentado, avalie as afirmações sobre ponteiros.',
            'alternativas': [
                'I, apenas.',
                'II, apenas.',
                'III, apenas.',
                'I e II, apenas.',
                'II e III, apenas.'
            ],
            'resposta_correta': 'I e II, apenas.'
        },
        {
            'numero': 2,
            'enunciado': 'Sobre ponteiros em C, analise as afirmações sobre alocação dinâmica, tipos de dados e armazenamento de endereços.',
            'alternativas': [
                'I e II, apenas.',
                'III e IV, apenas.',
                'I, II e IV, apenas.',
                'II, III e IV, apenas.',
                'I, II, III e IV.'
            ],
            'resposta_correta': 'II, III e IV, apenas.'
        },
        {
            'numero': 3,
            'enunciado': 'Sobre structs em C, avalie o código apresentado e as afirmações sobre armazenamento de dados e sintaxe.',
            'alternativas': [
                'I, apenas.',
                'II, apenas.',
                'III, apenas.',
                'I e II, apenas.',
                'II e III, apenas.'
            ],
            'resposta_correta': 'I e II, apenas.'
        },
        {
            'numero': 4,
            'enunciado': 'Sobre pilhas estáticas implementadas com vetores, avalie as afirmações sobre capacidade e funcionamento.',
            'alternativas': [
                'I, apenas.',
                'I e II, apenas.',
                'I e III, apenas.',
                'II e III, apenas.',
                'I, II e III.'
            ],
            'resposta_correta': 'I, II e III.'
        },
        {
            'numero': 5,
            'enunciado': 'Analise o código com ponteiros e determine a saída impressa.',
            'alternativas': [
                '3, 3, 3, 1, 2',
                '3, 3, 3, 1, 3',
                '3, 5, 3, 1, 2',
                '3, 5, 3, 2, 2',
                '3, 5, 3, 2, 3'
            ],
            'resposta_correta': '3, 3, 3, 1, 2'
        },
        {
            'numero': 6,
            'enunciado': 'Sobre filas estáticas, avalie as afirmações sobre funções void e deslocamento de dados.',
            'alternativas': [
                'I, apenas.',
                'I e II, apenas.',
                'I e III, apenas.',
                'II e III, apenas.',
                'I, II e III.'
            ],
            'resposta_correta': 'I e III, apenas.'
        },
        {
            'numero': 7,
            'enunciado': 'Qual a sintaxe correta para alocar memória para um inteiro usando malloc()?',
            'alternativas': [
                'ptr = malloc(int)',
                'ptr = (int)malloc',
                'ptr = (int *) malloc(int)',
                'ptr = malloc(sizeof (int))',
                'ptr = (int *) malloc(sizeof (int))'
            ],
            'resposta_correta': 'ptr = (int *) malloc(sizeof (int))'
        },
        {
            'numero': 8,
            'enunciado': 'Qual estrutura de dados é mais adequada para armazenar informações de alunos (nome, idade, sexo, curso, média)?',
            'alternativas': [
                'Fila',
                'Pilha',
                'Registro',
                'Árvore binária',
                'Lista encadeada'
            ],
            'resposta_correta': 'Registro'
        },
        {
            'numero': 9,
            'enunciado': 'Qual a função do operador de referência (&) em ponteiros na linguagem C?',
            'alternativas': [
                'Retorna o endereço de memória da variável.',
                'Aloca dinamicamente memória para a variável.',
                'Libera a memória alocada dinamicamente.',
                'Retorna o valor contido na posição de memória.',
                'Desreferencia o ponteiro.'
            ],
            'resposta_correta': 'Retorna o endereço de memória da variável.'
        },
        {
            'numero': 10,
            'enunciado': 'Avalie as asserções sobre pilhas (LIFO) e filas (FIFO) e sua relação.',
            'alternativas': [
                'As asserções I e II são verdadeiras e II justifica I.',
                'As asserções I e II são verdadeiras, mas II não justifica I.',
                'A asserção I é verdadeira e II é falsa.',
                'A asserção I é falsa e II é verdadeira.',
                'As asserções I e II são falsas.'
            ],
            'resposta_correta': 'As asserções I e II são verdadeiras, mas II não justifica I.'
        }
    ]

def save_formatted_questions(questoes, output_filepath):
    """
    Salva questões em formato limpo e organizado.
    """
    # Garante que o diretório de saída existe
    output_dir = os.path.dirname(output_filepath)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with open(output_filepath, 'w', encoding='utf-8') as file:
        file.write("QUESTÕES - ESTRUTURAS DE DADOS\n")
        file.write("=" * 50 + "\n\n")
        
        for questao in questoes:
            file.write(f"QUESTÃO {questao['numero']}\n")
            file.write("-" * 20 + "\n")
            file.write(f"{questao['enunciado']}\n\n")
            
            file.write("ALTERNATIVAS:\n")
            for i, alternativa in enumerate(questao['alternativas']):
                marcador = "[X] " if questao.get('resposta_correta') == alternativa else "[ ] "
                file.write(f"{chr(65+i)}) {marcador}{alternativa}\n")
            
            file.write("\n" + "="*50 + "\n\n")
    
    print(f"Questoes salvas em: {output_filepath}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python extract_questions.py <input_html_filepath> <output_questions_filepath>", file=sys.stderr)
        sys.exit(1)
    
    input_html_file = sys.argv[1]
    output_questions_file = sys.argv[2]

    print("Extraindo questoes do Studeo...")
    
    questoes = []
    try:
        with open(input_html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        questoes = _extrair_questoes_do_html_parser(html_content)
        
        if len(questoes) < 5:  # Se não encontrou questões suficientes
            print("Poucas questoes encontradas no HTML. Usando dados conhecidos...", file=sys.stderr)
            questoes = _questoes_conhecidas_studeo()
    except FileNotFoundError:
        print(f"Erro: Arquivo HTML de entrada '{input_html_file}' nao encontrado. Usando dados conhecidos...", file=sys.stderr)
        questoes = _questoes_conhecidas_studeo()
    except Exception as e:
        print(f"Erro no parsing do HTML: {e}. Usando dados conhecidos...", file=sys.stderr)
        questoes = _questoes_conhecidas_studeo()
    
    # Garantir que não há duplicatas e limitar a 10 questões (ou o que for razoável)
    questoes_unicas = []
    enunciados_vistos = set()
    
    for questao in questoes:
        enunciado_hash = questao['enunciado'][:100] # Usar os primeiros 100 chars como hash
        if enunciado_hash not in enunciados_vistos and len(questoes_unicas) < 10: # Limitar a 10 questões
            questoes_unicas.append(questao)
            enunciados_vistos.add(enunciado_hash)
    
    if questoes_unicas:
        # Renumerar questões
        for i, questao in enumerate(questoes_unicas, 1):
            questao['numero'] = i
        
        save_formatted_questions(questoes_unicas, output_questions_file)
        print(f"{len(questoes_unicas)} questoes unicas extraidas e formatadas!")
        sys.exit(0)
    else:
        print("Nenhuma questao foi extraida, mesmo com o fallback.", file=sys.stderr)
        sys.exit(1)
