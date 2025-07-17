from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import sys
import os

def fetch_html_with_selenium(username, password, login_url, exam_url, output_filepath):
    """
    Realiza login com Selenium, navega para a URL da prova e salva o HTML.
    """
    print("Iniciando configuracao do navegador para login e download...")
    options = Options()
    options.add_argument("--log-level=3")
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    options.add_argument("--headless")  # Mantido o modo headless
    # options.add_argument("--no-sandbox") # Mantido comentado
    # options.add_argument("--disable-dev-shm-usage") # Mantido comentado

    try:
        # Instala o ChromeDriver automaticamente e configura o serviço
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
        print(f"Acessando a pagina de login: {login_url}")
        driver.get(login_url)

        # Função para encontrar inputs de forma flexível
        def tenta_encontrar_input(driver_instance, selectors):
            for metodo, valor in selectors:
                try:
                    campo = WebDriverWait(driver_instance, 15).until(EC.presence_of_element_located((metodo, valor)))
                    return campo
                except:
                    continue
            return None

        usuario_selectors = [
            (By.ID, "usuario"),
            (By.NAME, "cpf"),
            (By.NAME, "usuario"),
            (By.XPATH, '//input[contains(@placeholder, "usuário")]'),
            (By.XPATH, '//input[contains(@placeholder, "CPF")]'),
        ]

        senha_selectors = [
            (By.ID, "senha"),
            (By.NAME, "senha"),
            (By.XPATH, '//input[contains(@placeholder, "senha")]'),
            (By.XPATH, '//input[@type="password"]'),
        ]

        print("Procurando campos de login...")
        input_usuario = tenta_encontrar_input(driver, usuario_selectors)
        input_senha = tenta_encontrar_input(driver, senha_selectors)

        if not input_usuario or not input_senha:
            raise Exception("Não foi possível localizar os campos de login.")

        print("Campos encontrados! Realizando login...")
        input_usuario.send_keys(username)
        input_senha.send_keys(password)
        input_senha.send_keys(Keys.ENTER)

        print("Aguarde, estamos entrando na prova...")
        # Usando time.sleep como no seu script antigo para replicar o comportamento
        time.sleep(8) # Espera após o login

        print(f"Acessando a pagina da prova: {exam_url}")
        driver.get(exam_url) # Navega para a URL da prova
        time.sleep(5) # Pequena espera adicional para garantir que todo o conteúdo dinâmico carregue

        print("Salvando conteudo da prova...")
        html = driver.page_source
        
        # Garante que o diretório de saída existe
        output_dir = os.path.dirname(output_filepath)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        with open(output_filepath, "w", encoding="utf-8") as f:
            f.write(html)

        print(f"Prova salva com sucesso em '{output_filepath}'.")
        sys.exit(0) # Sucesso

    except Exception as e:
        print(f"Erro no processo de Selenium: {e}", file=sys.stderr)
        sys.exit(1) # Erro
    finally:
        if 'driver' in locals() and driver:
            driver.quit() # Garante que o navegador seja fechado

if __name__ == "__main__":
    # Espera 5 argumentos: username, password, login_url, exam_url, output_filepath
    if len(sys.argv) != 6:
        print("Uso: python fetch_html.py <username> <password> <login_url> <exam_url> <output_filepath>", file=sys.stderr)
        sys.exit(1)
    
    user = sys.argv[1]
    pwd = sys.argv[2]
    login_url_arg = sys.argv[3]
    exam_url_arg = sys.argv[4]
    output_file = sys.argv[5]
    
    fetch_html_with_selenium(user, pwd, login_url_arg, exam_url_arg, output_file)
