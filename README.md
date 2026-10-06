# IoT Composter

Monitoramento de uma composteira IoT (compostagem de carcaças de suínos com serragem/maravalha).

- **`api/`**: API REST (Node.js, Express, TypeScript, MySQL). Recebe a telemetria do ESP32, controla o ciclo da composteira e envia alertas push.
- **`app/`**: aplicativo mobile (React Native, Expo, TypeScript). Mostra o painel, o histórico e controla o ciclo.

```
ESP32 ──HTTP POST──▶ API (Node + MySQL) ──push (Expo/FCM)──▶ App no celular
                          ▲                                       │
                          └────────── GET/POST (axios) ───────────┘
```

## 1. O que instalar

| Ferramenta | Versão | Para quê |
|---|---|---|
| [Node.js](https://nodejs.org) | 20 ou superior | Rodar API e app |
| [pnpm](https://pnpm.io/installation) | 9 ou superior | Gerenciador de pacotes (`npm i -g pnpm`) |
| [MySQL](https://dev.mysql.com/downloads/) | 8 | Banco de dados |
| [Git](https://git-scm.com) | qualquer | Clonar o projeto |
| Celular Android | | Para testar o app e as notificações |
| [Expo Go](https://expo.dev/go) **ou** development build | | Ver o app no celular (veja a seção 5) |

Para gerar o development build (necessário para receber push no Android): conta gratuita em [expo.dev](https://expo.dev) e `eas-cli` (usado via `pnpm dlx eas-cli`, sem instalar).

## 2. Instalar as dependências

Na raiz do projeto:

```bash
pnpm install
```

O projeto é um workspace do pnpm (`api` e `app`), então esse comando instala os dois.

## 3. Banco de dados

1. Suba o MySQL.
2. Execute os scripts, nesta ordem:

```bash
mysql -u root -p < api/sql/init.sql
mysql -u root -p < api/sql/02_ciclos.sql
```

Isso cria o banco `db_composteira` e as tabelas `leituras_sensores`, `dispositivos_alertas`, `ciclos_compostagem` e `eventos_animais`.

## 4. Rodar a API

```bash
cd api
cp .env.example .env     # no Windows: copy .env.example .env
```

Edite o `.env` com os dados do seu MySQL (`DB_USER`, `DB_PASSWORD`...). Depois:

```bash
pnpm dev
```

A API sobe em `http://localhost:3000`. Teste rápido: `http://localhost:3000/api/leituras` deve responder `[]`.

> No Windows, libere a porta **3000** no firewall para que o celular e o ESP32 consigam acessar o PC.

### Rotas

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/leituras` | Recebe a telemetria do ESP32 (valida faixas dos sensores) |
| GET | `/api/leituras` | Últimas 20 leituras |
| POST | `/api/tokens` | Cadastra o token de push do celular |
| GET | `/api/ciclos/atual` | Ciclo em andamento (404 se não houver) |
| POST | `/api/ciclos` | Inicia um ciclo (ENCHIMENTO) |
| POST | `/api/ciclos/animais` | Adiciona animal: `{"peso_estimado_kg": 120}` |
| POST | `/api/ciclos/fechar` | Fecha a célula (ENCHIMENTO → ATIVA) |
| POST | `/api/ciclos/maturacao` | Encerra a fase ativa (ATIVA → MATURACAO) |

Corpo esperado do ESP32 em `POST /api/leituras`:

```json
{"temperatura_ambiente": 26.5, "umidade_ambiente": 60.1, "temperatura_composteira": 35.2, "gas_amonia_raw": 1240}
```

Faixas aceitas (fora delas, a API responde 400): temperatura da composteira -10 a 85, umidade 0 a 100, temperatura ambiente -10 a 60, gás 0 a 4095 (inteiro).

## 5. Rodar o app

1. Descubra o IP do PC na rede Wi-Fi (`ipconfig` no Windows, campo "Endereço IPv4" do adaptador Wi-Fi).
2. Em `app/src/config.ts`, ajuste `API_IP` para esse IP. Celular e PC precisam estar na **mesma rede**.
3. Inicie o app:

```bash
cd app
pnpm start
```

### Opção A: Expo Go (rápido, sem notificações push)

Rode `pnpm exec expo start --go` (ou aperte `s` no terminal para alternar o modo) e leia o QR code com o Expo Go.
O painel, o histórico e o controle do ciclo funcionam. **Push remoto não funciona no Expo Go em Android** (removido desde o SDK 53).

### Opção B: development build (com notificações push)

Siga os passos **na ordem**. Os passos 1 a 3 são configurações que só você pode fazer (contas e chaves pessoais não ficam no git).

#### Passo 1: conta e projeto no Expo (`app.json`)

O `app/app.json` já vem apontando para o projeto do dono original:

```json
"owner": "composters-team",
"extra": { "eas": { "projectId": "00fcf232-13f4-4ccf-b6a0-181be5725f0e" } }
```

Você só consegue gerar o build nesse projeto se for membro da organização `composters-team` no Expo. Escolha **uma** das opções:

- **Opção 1: usar o projeto original.** Peça ao dono para convidar o seu usuário do expo.dev para a organização `composters-team` e não altere nada no `app.json`.
- **Opção 2: usar a sua própria conta (recomendado para testar por conta própria).**
  1. Crie uma conta gratuita em [expo.dev](https://expo.dev).
  2. No `app/app.json`, **apague** a linha `"owner": "composters-team"` e o bloco `"extra": { "eas": { ... } }`.
  3. Faça login e crie o seu projeto, que grava o `owner` e o `projectId` novos no `app.json`:

     ```bash
     cd app
     pnpm dlx eas-cli login
     pnpm dlx eas-cli init
     ```

  Não suba essas alterações do `app.json` para o repositório principal sem combinar com o dono, para não trocar o projeto dele.

#### Passo 2: Firebase e `google-services.json`

O Android só recebe push através do Firebase Cloud Messaging (FCM).

1. Em [console.firebase.google.com](https://console.firebase.google.com), crie um projeto.
2. Dentro dele, adicione um app **Android** com o nome de pacote exatamente `com.iotcomposter.app` (é o `android.package` do `app.json`; se quiser outro, altere nos dois lugares).
3. Baixe o `google-services.json` e coloque-o em **`app/google-services.json`**. O `app.json` já aponta para esse caminho (`googleServicesFile`). O arquivo não vai para o git (está no `.gitignore`).

#### Passo 3: credencial de envio de push (FCM v1)

1. No Firebase: Configurações do projeto → **Contas de serviço** → **Gerar nova chave privada**. Isso baixa um arquivo `.json`; guarde-o fora do projeto e nunca o suba para o git.
2. Envie essa chave para o Expo:

   ```bash
   cd app
   pnpm dlx eas-cli credentials
   ```

   Escolha **Android**, depois o perfil de build (`development`), e a opção **Google Service Account Key for Push Notifications (FCM V1)**. Selecione o `.json` baixado.

#### Passo 4: `eas.json` (perfis de build)

O `app/eas.json` já está pronto, e você normalmente não precisa alterá-lo. Se ele não existir, crie com `pnpm dlx eas-cli build:configure`. Perfis:

| Perfil | Uso |
|---|---|
| `development` | Development build com o dev client. Precisa do `pnpm start` rodando. É o que se usa para testar. |
| `preview` | APK interno independente do PC, para distribuir a testadores. |
| `production` | Build de loja (Play Store). |

#### Passo 5: gerar e instalar o build

```bash
cd app
pnpm dlx eas-cli build --profile development --platform android
```

Na primeira vez o EAS pergunta se pode gerar e guardar a keystore do Android: responda que sim. Ao terminar, abra o link (ou o QR code) no celular e instale o APK. O Android pode pedir para liberar "instalar apps de fontes desconhecidas".

#### Passo 6: abrir o app e receber o push

1. Confirme o `API_IP` em `app/src/config.ts` e rode `pnpm start` dentro de `app/`.
2. Abra o app instalado no celular e **aceite a permissão de notificações**. O token é enviado automaticamente à API.
3. Confira no MySQL: `SELECT * FROM dispositivos_alertas;` deve ter uma linha.

#### Resumo do que é pessoal de cada pessoa

| Item | Onde | Vai no git? |
|---|---|---|
| Conta Expo / `owner` / `projectId` | `app/app.json` | Sim (cuidado ao alterar) |
| `google-services.json` (Firebase) | `app/` | Não |
| Chave de conta de serviço FCM | Enviada ao Expo via `eas credentials` | Não |
| IP da API | `app/src/config.ts` | Sim (cada um edita localmente) |
| Credenciais do MySQL | `api/.env` | Não |

Alterações apenas de código (telas, componentes) aparecem na hora, sem novo build. Mexer em `app.json`, plugins ou bibliotecas nativas exige um novo build.

## 6. Testar o fluxo completo

Sem o ESP32, simule-o com `curl`:

1. **Iniciar ciclo:** `curl -X POST http://localhost:3000/api/ciclos`
2. **Adicionar animal:** `curl -X POST http://localhost:3000/api/ciclos/animais -H "Content-Type: application/json" -d "{\"peso_estimado_kg\": 120}"`
3. **Fechar a célula:** `curl -X POST http://localhost:3000/api/ciclos/fechar` (ou pelo app)
4. **Enviar uma leitura crítica** (com o app fechado, para ver o push):

```bash
curl -X POST http://localhost:3000/api/leituras -H "Content-Type: application/json" \
  -d "{\"temperatura_ambiente\": 26.5, \"umidade_ambiente\": 60, \"temperatura_composteira\": 72, \"gas_amonia_raw\": 1900}"
```

Se tudo estiver certo, o celular recebe dois alertas (superaquecimento e decomposição anaeróbica) e o app mostra os cards em vermelho.

### Regras de alerta (só com a célula ATIVA)

| Medida | Faixa | Nível |
|---|---|---|
| Temperatura da composteira | < 40 °C | Baixo |
| | 66 a 70 °C | Médio |
| | > 70 °C | Crítico |
| Amônia (MQ-135) | 1000 a 1800 | Médio |
| | > 1800 | Crítico |

O mesmo alerta só é reenviado após 30 minutos. Entre 40 e 66 °C não há alerta.

## 7. Problemas comuns

- **App mostra "Não foi possível carregar as leituras":** confira o `API_IP`, se a API está rodando, se estão na mesma rede e se o firewall libera a porta 3000.
- **Erro de conexão com o MySQL na API:** revise o `api/.env` e se os scripts SQL foram executados.
- **Push não chega:** confira se está usando o development build (não o Expo Go), se o `google-services.json` e a credencial FCM foram configurados, e se há uma linha na tabela `dispositivos_alertas`.
- **Adicionar animal retorna 409:** só é permitido com a célula em ENCHIMENTO. Com a célula ATIVA, adicionar zeraria a quarentena sanitária.
