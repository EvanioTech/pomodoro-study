# Pomodoro Study App

O **Pomodoro Study App** é uma aplicação desktop moderna projetada para aumentar sua produtividade e foco. Combinando a técnica Pomodoro com um gerenciador de tarefas integrado, ele permite que você acompanhe seu tempo de estudo e gerencie suas metas diárias em uma interface elegante e minimalista.

## 🚀 Funcionalidades

### ⏱️ Timer Pomodoro Inteligente
*   **Ciclos Personalizáveis**: Configure a duração dos seus períodos de Foco, Pausa Curta e Pausa Longa.
*   **Alternância Automática**: O timer sugere automaticamente o próximo modo (Estudo ou Pausa) após o término de um ciclo.
*   **Pausa Longa Automática**: Após completar 4 sessões de estudo, o aplicativo sugere automaticamente uma pausa longa para descanso.
*   **Alarme Sonoro**: Notificação sonora suave ao final de cada ciclo para que você não perca o tempo.

### 📝 Gerenciamento de Tarefas e Metas
*   **Criação de Tarefas**: Adicione tarefas com nomes personalizados.
*   **Metas de Tempo**: Defina metas de tempo (horas e minutos) para cada tarefa específica.
*   **Rastreamento de Progresso**: Selecione uma tarefa na aba "Timer", e o tempo estudado será automaticamente adicionado ao progresso daquela tarefa.
*   **Visualização de Progresso**: Barras de progresso visuais mostram o quanto você já completou de cada meta.
*   **Edição e Exclusão**: Gerencie suas tarefas facilmente, editando metas ou removendo itens concluídos.

### 💾 Persistência de Dados
*   Todos os seus dados (tarefas, configurações de tempo e histórico de sessões) são salvos automaticamente no armazenamento local do seu computador. Você pode fechar o aplicativo e voltar exatamente de onde parou.

### 🎨 Interface Moderna
*   Design estilo **Glassmorphism** (efeito de vidro fosco).
*   Temas visuais que se adaptam ao modo atual (Estudo ou Pausa), ajudando a sinalizar visualmente o estado do seu fluxo de trabalho.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias:

*   **[Tauri](https://tauri.app/)**: Para criar um aplicativo desktop leve e seguro.
*   **[React](https://reactjs.org/)**: Biblioteca JavaScript para construção da interface do usuário.
*   **[TypeScript](https://www.typescriptlang.org/)**: Para um código mais seguro e tipado.
*   **[Vite](https://vitejs.dev/)**: Ferramenta de build rápida e eficiente.
*   **CSS Puro**: Estilização customizada sem dependência de frameworks pesados.

## 📦 Como Instalar e Rodar

Para rodar este projeto em sua máquina local, você precisará ter o [Node.js](https://nodejs.org/) e o [Rust](https://www.rust-lang.org/tools/install) instalados (necessário para o Tauri).

1.  **Clone o repositório:**
    ```bash
    git clone https://seu-repositorio/pomodoro-study.git
    cd pomodoro-study
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Rode em modo de desenvolvimento (Web):**
    Para testar apenas a interface no navegador:
    ```bash
    npm run dev
    ```

4.  **Rode como aplicativo Desktop (Tauri):**
    Para iniciar a aplicação desktop:
    ```bash
    npm run tauri dev
    ```

5.  **Build para Produção:**
    Para gerar o executável final:
    ```bash
    npm run tauri build
    ```

## ⚙️ Configuração

O aplicativo funciona "out-of-the-box" e não requer configurações complexas de ambiente. Todas as preferências do usuário são gerenciadas dentro da própria interface na seção de configurações do Timer.

---
Desenvolvido com foco e ❤️.
