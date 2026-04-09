# 💈 navalha navalha — Sistema de Agendamento para Barbearia

> Site institucional e sistema de agendamento moderno, responsivo e funcional — desenvolvido com HTML, CSS e JavaScript puro, sem dependências externas.

---

## 📋 Sobre o Projeto

A **navalha navalha** é um sistema de agendamento digital para barbearia com seleção de serviços, grade de horários inteligente e confirmação visual em tempo real. Desenvolvido como um único arquivo `barbearia.html`, não requer servidor, framework ou instalação.

---

## 🌐 Link para acessar

https://lguilherme-7.github.io/DonNavarro/

---

## ✨ Funcionalidades

- **Hero institucional** com nome da barbearia, slogan e badge de status ao vivo
- **Catálogo de serviços** em grid clicável com:
  - Ícone, nome, preço e duração de cada serviço
  - Seleção visual com check animado e brilho dourado
- **Formulário de agendamento** com:
  - Campo de nome do cliente
  - Seleção de serviço por botão (sem dropdown)
  - Seleção de data com bloqueio de datas passadas
  - Grade de horários dinâmica gerada a partir da data escolhida
  - Preview do horário selecionado no campo de hora
  - Validação em tempo real — botão só habilita quando tudo está preenchido
- **Regras de horário** inteligentes:
  - Horários já agendados aparecem riscados e bloqueados
  - Horários passados do dia atual são automaticamente desabilitados
  - Verificação dupla no momento do envio (evita duplicatas por corrida)
- **Lista de agendamentos** com:
  - Avatar inicial do nome do cliente
  - Serviço, data, hora e preço de cada reserva
  - Ordenação automática por data e hora
  - Botão para cancelar agendamento individualmente
  - Contador de agendamentos ativos no cabeçalho
- **Persistência via LocalStorage** — agendamentos mantidos ao fechar o navegador
- **Toasts de feedback** animados para todas as ações (confirmar, cancelar, erro de conflito)
- **Design dark luxury** com tema dourado, tipografia refinada e textura sutil
- **Totalmente responsivo** (mobile first)

---

## 🗂️ Estrutura do Projeto

```
navalha-navarro/
└── barbearia.html    # Aplicação completa (HTML + CSS + JS em um único arquivo)
```

O projeto é intencionalmente um arquivo único para facilitar deploy e distribuição. O código interno está organizado em três blocos bem delimitados por comentários:

| Bloco | Localização | Conteúdo |
|---|---|---|
| HTML | `<body>` | Estrutura e marcação semântica |
| CSS | `<style>` | Estilos, variáveis e responsividade |
| JS | `<script>` | Dados, lógica e interatividade |

---

## 🚀 Como Usar

**1. Clone ou baixe o projeto:**
```bash
git clone https://github.com/seu-usuario/navalha-navarro.git
```

**2. Abra o arquivo no navegador:**
```bash
# Simplesmente abra o arquivo:
open barbearia.html

# Ou com um servidor local (opcional):
npx serve .
```

Não é necessário instalar nada. Funciona offline diretamente no navegador.

---

## ⚙️ Configuração

### Nome e identidade da barbearia

No bloco HTML, localize a seção `.hero` e altere o nome, slogan e informações de contato:

```html
<h1>navalha <span>Navarro</span></h1>
<p>Barbearia clássica com técnica moderna. Agende agora.</p>
```

```html
<!-- No rodapé: -->
<span>navalha Navarro Barbearia</span> · Seg–Sáb 09h–19h · (35) 99800-0000
```

### Serviços e preços

Os serviços estão definidos no array `SERVICES` no bloco `<script>`. Cada item segue esta estrutura:

```javascript
{
  id:    'combo',            // ID único (string, sem espaços)
  name:  'Corte + Barba',   // Nome exibido no botão
  price: 'R$ 65',           // Preço (texto livre)
  time:  '50 min',          // Duração estimada
  icon:  '💈'               // Emoji exibido no card
}
```

Para adicionar ou remover serviços, basta editar o array — os botões são gerados automaticamente.

### Horários disponíveis

A grade de horários é definida no array `ALL_SLOTS` no script:

```javascript
const ALL_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '13:00','13:30','14:00','14:30','15:00','15:30',
  '16:00','16:30','17:00','17:30','18:00','18:30',
];
```

Adicione ou remova horários conforme o expediente da barbearia. O sistema bloqueia automaticamente os já reservados e os horários passados no dia atual.

### Chave de armazenamento (LocalStorage)

Os agendamentos são salvos sob a chave `navalhanavarro_appts`. Para resetar todos os dados, limpe essa chave no navegador (DevTools → Application → LocalStorage) ou altere a constante para isolar ambientes:

```javascript
const STORAGE_KEY = 'navalhanavarro_appts'; // ← Altere aqui se necessário
```

---

## 🎨 Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 semântico | Estrutura e acessibilidade |
| CSS3 (variáveis, grid, flexbox, animations) | Layout, tema dark e microinterações |
| JavaScript ES6+ | Lógica, DOM e LocalStorage |
| Google Fonts (Playfair Display + DM Sans + DM Mono) | Tipografia refinada |

Sem frameworks, sem bundlers, sem dependências de terceiros.

---

## 📱 Responsividade

| Breakpoint | Layout |
|---|---|
| `> 768px` | Duas colunas — formulário à esquerda, lista à direita |
| `≤ 768px` | Coluna única — formulário acima, lista abaixo |
| `≤ 500px` | Grid de serviços 2 colunas, campos em coluna única |

---

## 🔧 Personalização Rápida

**Alterar as cores principais** — edite as variáveis CSS no topo do `<style>`:

```css
:root {
  --gold:       #C9A96E;  /* Cor dourada principal */
  --gold-light: #E8D4A8;  /* Dourado claro / textos secundários */
  --gold-dim:   #7A5C2E;  /* Dourado escuro / bordas */
  --bg:         #0D0D0D;  /* Fundo principal */
  --bg-2:       #141414;  /* Fundo dos painéis */
  --bg-3:       #1C1C1C;  /* Fundo dos inputs e cards */
  --text:       #F0EBE0;  /* Texto principal */
  --green:      #52A887;  /* Badge "ao vivo" / confirmação */
  --red:        #E05252;  /* Cancelamento / erro */
}
```

**Mudar o tema para claro** — substitua as variáveis de fundo e texto pelas inversas e ajuste `--border` para tons escuros.

---

## 🗃️ Estrutura dos Dados

Cada agendamento é um objeto JSON salvo no array em LocalStorage:

```javascript
{
  id:        "abc123xy",         // ID único (timestamp + random)
  name:      "Carlos Mendes",    // Nome do cliente
  service:   "combo",            // ID do serviço selecionado
  svcName:   "Corte + Barba",    // Nome do serviço (desnormalizado)
  svcIcon:   "💈",               // Emoji do serviço
  price:     "R$ 65",            // Preço no momento do agendamento
  date:      "2025-11-15",       // ISO 8601 (YYYY-MM-DD)
  time:      "10:00",            // Horário (HH:MM)
  createdAt: "2025-11-14T18:32:00.000Z" // Timestamp de criação
}
```

---

## 📦 Deploy

Por ser um único arquivo estático, o navalha Navarro pode ser hospedado em qualquer serviço:

- **GitHub Pages** — suba o repositório e ative Pages na branch `main`
- **Netlify / Vercel** — arraste a pasta para o dashboard
- **Qualquer hospedagem compartilhada** — upload via FTP

> ⚠️ Os dados ficam no **navegador do usuário** (LocalStorage). Cada dispositivo/navegador terá seu próprio conjunto de agendamentos. Para uso real em barbearia com múltiplos atendentes, considere integrar um backend ou planilha via API.

---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se livre para usar, modificar e distribuir.

---

Feito com ✂️ e muito estilo.
