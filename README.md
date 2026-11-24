











# MarcenariaPro — Backend

Sistema de Gestão para Marcenaria — TCC do curso de Tecnologia em Análise e Desenvolvimento de Sistemas (TADS), IFPR Campus Cascavel.

Backend desenvolvido em **Java 21 + Spring Boot 4.1.0**, banco de dados **MySQL 8.4 em Docker** e autenticação utilizando **JWT**, com perfis de Administrador e Funcionário.

O sistema possui módulos para clientes, fornecedores e seus vendedores vinculados, projetos, ambientes, orçamentos, pedidos, produção, estoque, pagamentos, assistência técnica, substituição de materiais e relatórios.

---

## 1. Tecnologias utilizadas

- Java 21

- Spring Boot 4.1.0

- Spring Data JPA

- Hibernate

- Spring Security

- JWT

- MySQL 8.4

- Docker

- Maven

- API REST

---

## 2. Como executar

### 2.1 Pré-requisitos

Para executar o projeto é necessário possuir:

- Java 21

- Docker

- Docker Compose

- Git

- Maven ou Maven Wrapper

O Docker Desktop deve estar em execução.

### 2.2 Banco de dados

O projeto utiliza MySQL 8.4 através do Docker.

Na raiz do projeto, execute:

```bash

docker compose up -d

```

O banco será iniciado no container:

```text

marcenariapro-mysql

```

Banco de dados:

```text

marcenariapro

```

Porta:

```text

3306

```

Para verificar os containers:

```bash

docker ps

```

### 2.3 Executar a aplicação

Com o banco iniciado, execute:

```bash

./mvnw spring-boot:run

```

No Windows, também pode ser utilizado:

```powershell

.\mvnw.cmd spring-boot:run

```

A aplicação ficará disponível em:

```text

http://localhost:8080

```

Para verificar se a aplicação está funcionando:

```bash

curl http://localhost:8080/

```

### 2.4 Parar o projeto

Para parar os containers:

```bash

docker compose down

```

Esse comando mantém os dados persistidos nos volumes.

Para remover os containers e também os volumes:

```bash

docker compose down -v

```

> O comando `docker compose down -v` remove os dados persistidos do banco de dados.

---

## 3. Estrutura do projeto

```text

marcenariapro/

├── docker-compose.yml

├── Dockerfile

├── pom.xml

└── src/

    └── main/

        ├── java/

        │   └── br/

        │       └── edu/

        │           └── ifpr/

        │               └── marcenariapro/

        │                   ├── config/

        │                   ├── controller/

        │                   ├── dto/

        │                   ├── entity/

        │                   ├── enums/

        │                   ├── repository/

        │                   ├── security/

        │                   └── service/

        │

        └── resources/

            └── application.properties

```

### Principais pacotes

| Pacote | Função |

|---|---|

| `entity` | Entidades utilizadas pelo banco de dados |

| `repository` | Acesso ao banco de dados através do Spring Data JPA |

| `service` | Implementação das regras de negócio |

| `controller` | Endpoints da API REST |

| `dto` | Objetos utilizados nas requisições e respostas |

| `security` | Configurações relacionadas à autenticação e segurança |

| `config` | Configurações gerais da aplicação |

| `enums` | Enumerações utilizadas pelos módulos |

---

## 4. Autenticação

A API utiliza autenticação baseada em **JWT (JSON Web Token)**.

### 4.1 Login

Endpoint:

```http

POST /auth/login

```

Exemplo:

```json

{

    "email": "EMAIL_DO_USUARIO",

"senha": "SENHA_DO_USUARIO"
}

```

Após o login, a API retorna um token JWT.

Esse token deve ser enviado nas requisições protegidas utilizando o cabeçalho:

```text

Authorization: Bearer <token>

```

---

## 5. Principais endpoints

| Módulo | Endpoint base |

|---|---|

| Autenticação | `/auth` |

| Usuários | `/usuarios` |

| Clientes | `/clientes` |

| Projetos | `/projetos` |

| Ambientes | `/ambientes` |

| Orçamentos | `/orcamentos` |

| Pedidos | `/pedidos` |

| Produção | `/producoes` |

| Materiais | `/materiais` |

| Movimentações de estoque | `/movimentacoes-estoque` |

| Pagamentos | `/pagamentos` |

| Assistência técnica | `/assistencias-tecnicas` |

| Substituição de materiais | `/solicitacoes-substituicao` |

| Relatórios | `/relatorios` |

---

## 6. Clientes

O módulo de clientes permite cadastrar e gerenciar os clientes da marcenaria.

Endpoints:

```http

POST   /clientes

GET    /clientes

GET    /clientes/{id}

PUT    /clientes/{id}

DELETE /clientes/{id}

```

O cadastro possui validações dos principais dados do cliente.

O sistema também verifica os relacionamentos existentes antes de permitir alterações ou exclusões.

---

## 7. Projetos

Os projetos representam os trabalhos realizados para cada cliente.

Endpoints:

```http

POST   /projetos

GET    /projetos

GET    /projetos/{id}

PUT    /projetos/{id}

DELETE /projetos/{id}

GET    /projetos/{id}/total

```

Um projeto pertence a um cliente e pode possuir vários ambientes.

Exemplo:

```text

Projeto

├── Cozinha

├── Sala

├── Quarto

└── Banheiro

```

Cada ambiente possui seu próprio orçamento.

---

## 8. Ambientes

Os ambientes representam as partes individuais de um projeto.

Endpoints:

```http

POST   /ambientes

GET    /ambientes

GET    /ambientes/{id}

PUT    /ambientes/{id}

DELETE /ambientes/{id}

```

Um ambiente pertence a um projeto.

Podem ser armazenadas informações como:

- nome do ambiente;

- medidas;

- observações;

- imagens;

- complexidade.

A complexidade do ambiente é utilizada nas regras relacionadas ao orçamento e ao cálculo da mão de obra.

---

## 9. Materiais

O módulo de materiais controla os materiais utilizados pela marcenaria.

Endpoints:

```http

POST   /materiais

GET    /materiais

GET    /materiais/{id}

PUT    /materiais/{id}

DELETE /materiais/{id}

GET    /materiais/estoque-baixo

```

Os materiais possuem informações como:

- nome;

- descrição;

- quantidade;

- estoque mínimo;

- valor unitário.

A quantidade em estoque não é alterada diretamente durante uma atualização cadastral.

As alterações de quantidade são realizadas através das movimentações de estoque.

---

## 10. Movimentações de estoque

As movimentações registram entradas e saídas de materiais.

Endpoints:

```http

POST   /movimentacoes-estoque

GET    /movimentacoes-estoque

GET    /movimentacoes-estoque/{id}

DELETE /movimentacoes-estoque/{id}

```

Tipos de movimentação:

```text

ENTRADA

SAIDA

```

### Regras

Uma entrada aumenta a quantidade disponível:

```text

estoque atual + quantidade da entrada

```

Uma saída reduz a quantidade disponível:

```text

estoque atual - quantidade da saída

```

Não é permitida uma saída maior que o estoque disponível.

As movimentações não podem ser excluídas, preservando o histórico das operações.

---

## 11. Orçamentos

O módulo de orçamento permite calcular e controlar os valores dos ambientes.

Endpoints:

```http

POST   /orcamentos

GET    /orcamentos

GET    /orcamentos/{id}

PUT    /orcamentos/{id}

DELETE /orcamentos/{id}

```

Cada ambiente possui seu próprio orçamento.

### Regras principais

- não é permitido criar orçamento duplicado para o mesmo ambiente;

- o orçamento possui validade;

- orçamento vencido não pode ser aprovado;

- orçamento aprovado não pode ser alterado livremente;

- orçamento aprovado pode gerar pedido;

- orçamento vinculado a pedido não pode ser excluído;

- o valor do orçamento deve ser válido;

- materiais e mão de obra fazem parte da composição do orçamento.

---

## 12. Pedidos

Os pedidos representam os serviços aprovados que serão executados pela marcenaria.

Endpoints:

```http

POST   /pedidos

GET    /pedidos

GET    /pedidos/{id}

PUT    /pedidos/{id}

DELETE /pedidos/{id}

```

Um pedido está relacionado a um orçamento aprovado.

### Regras principais

- somente orçamento aprovado pode gerar pedido;

- não é permitido criar mais de um pedido para o mesmo orçamento;

- pedidos possuem controle de status;

- alterações dependem do status atual;

- pedidos relacionados a produções iniciadas não podem ser excluídos;

- pedidos concluídos não podem ser excluídos.

---

## 13. Produção

O módulo de produção controla a execução dos pedidos.

Endpoints:

```http

POST   /producoes

GET    /producoes

GET    /producoes/{id}

PUT    /producoes/{id}

DELETE /producoes/{id}

```

Materiais utilizados na produção:

```http

POST /producoes/{producaoId}/materiais

GET  /producoes/{producaoId}/materiais

```

### Status da produção

```text

AGUARDANDO

EM_PRODUCAO

PRONTO

ENTREGUE

CANCELADO

```

### Regras principais

A produção somente pode ser iniciada após o pagamento de pelo menos **30% do valor do pedido**.

Também é verificada a disponibilidade dos materiais necessários.

Quando um material é utilizado na produção, sua quantidade é retirada do estoque.

Caso uma produção seja cancelada, os materiais utilizados são devolvidos ao estoque.

Produções iniciadas, concluídas ou canceladas não podem ser excluídas.

Quando a produção é marcada como:

```text

ENTREGUE

```

o pedido relacionado também passa para:

```text

ENTREGUE

```

---

## 14. Pagamentos

O módulo de pagamentos permite registrar pagamentos relacionados aos pedidos.

Endpoints:

```http

POST /pagamentos

GET  /pagamentos

GET  /pagamentos/pedido/{pedidoId}

GET  /pagamentos/pedido/{pedidoId}/resumo

```

O sistema permite pagamentos parciais e totais.

### Regras principais

- não é permitido pagar um valor superior ao valor do pedido;

- pagamentos possuem status;

- pagamentos podem ser registrados com uma data informada;

- antes da produção é necessário possuir pelo menos 30% do pedido pago;

- o restante do pagamento pode ser realizado posteriormente;

- o sistema calcula o valor total recebido e o valor restante.

A entrega não exige que 100% do pedido esteja pago.

O pagamento restante pode ser realizado após a entrega, conforme as regras definidas para o sistema.

---

## 15. Assistência técnica

O módulo de assistência técnica permite registrar problemas relacionados aos pedidos já realizados.

Endpoints:

```http

POST   /assistencias-tecnicas

GET    /assistencias-tecnicas

GET    /assistencias-tecnicas/{id}

PUT    /assistencias-tecnicas/{id}

DELETE /assistencias-tecnicas/{id}

```

### Materiais utilizados

```http

POST /assistencias-tecnicas/{id}/materiais

GET  /assistencias-tecnicas/{id}/materiais

```

A assistência possui informações como:

- cliente;

- pedido;

- funcionário responsável;

- data da solicitação;

- data de agendamento;

- descrição;

- data de entrega original;

- valor do serviço;

- valor dos materiais;

- status.

### Garantia

O sistema verifica o período de garantia utilizando a data de entrega original do pedido.

Dentro do período de garantia, o valor do serviço é zerado.

Os materiais utilizados continuam sendo considerados no cálculo quando aplicável.

Fora da garantia, o serviço pode possuir cobrança de mão de obra e materiais.

Quando uma assistência técnica é excluída, os materiais utilizados nela são devolvidos ao estoque.

---

## 16. Solicitação de substituição de materiais

O sistema possui um módulo para controlar solicitações de substituição de materiais.

Endpoints:

```http

POST /solicitacoes-substituicao

PUT  /solicitacoes-substituicao/{id}/aprovar

PUT  /solicitacoes-substituicao/{id}/recusar

```

A substituição de material depende de aprovação.

Esse controle evita que um material seja substituído durante a produção sem que a alteração seja registrada e aprovada.

---

### Fornecedores e vendedores vinculados

O módulo de fornecedores permite cadastrar e manter os dados das empresas que fornecem materiais e produtos para a marcenaria.

O cadastro do fornecedor contempla:

nome fantasia, de preenchimento obrigatório;
razão social, de preenchimento opcional;
CNPJ, com validação;
endereço, com consulta de CEP por meio da integração com o ViaCEP;
telefones para contato;
indicação de qual número deve ser utilizado para contato pelo WhatsApp.
Também é possível cadastrar vendedores vinculados a cada fornecedor, armazenando o nome e o telefone de contato. O sistema permite iniciar uma conversa pelo WhatsApp utilizando o número selecionado.

Os vendedores ficam associados ao respectivo fornecedor, facilitando a identificação dos contatos comerciais de cada empresa.

---

## 17. Usuários

O sistema possui gerenciamento de usuários e perfis de acesso.

Endpoint base:

```text

/usuarios

```

Os principais perfis são:

```text

ADMINISTRADOR

FUNCIONARIO

```

A autenticação é realizada através do módulo de segurança e utiliza JWT.

---

## 18. Relatórios

O sistema possui um módulo de relatórios para apresentar informações consolidadas.

Endpoints:

```http

GET /relatorios/resumo

GET /relatorios/estoque

GET /relatorios/financeiro

GET /relatorios/producao

GET /relatorios/pedidos-status

GET /relatorios/assistencias-status

```

### 18.1 Resumo

Endpoint:

```http

GET /relatorios/resumo

```

Apresenta informações como:

- total de clientes;

- total de projetos;

- total de orçamentos;

- total de pedidos;

- pedidos em produção;

- pedidos concluídos;

- total de assistências;

- valor total das vendas;

- valor total recebido.

### 18.2 Estoque

Endpoint:

```http

GET /relatorios/estoque

```

Lista materiais que estão com estoque igual ou abaixo do estoque mínimo.

### 18.3 Financeiro

Endpoint:

```http

GET /relatorios/financeiro

```

Apresenta, por pedido:

- valor do pedido;

- valor pago;

- valor restante;

- situação do pagamento.

Situações utilizadas:

```text

PENDENTE

PARCIALMENTE_PAGO

PAGO

```

### 18.4 Produção

Endpoint:

```http

GET /relatorios/producao

```

Apresenta a quantidade de produções por status.

### 18.5 Pedidos por status

Endpoint:

```http

GET /relatorios/pedidos-status

```

Apresenta a quantidade de pedidos agrupados por status.

### 18.6 Assistências por status

Endpoint:

```http

GET /relatorios/assistencias-status

```

Apresenta a quantidade de assistências técnicas agrupadas por status.

---

## 19. Fluxo principal do sistema

O fluxo básico de utilização do MarcenariaPro é:

```text

Cliente

   ↓

Projeto

   ↓

Ambientes

   ↓

Orçamento de cada ambiente

   ↓

Aprovação dos orçamentos

   ↓

Pedido

   ↓

Pagamento mínimo de 30%

   ↓

Produção

   ↓

Materiais retirados do estoque

   ↓

Produção pronta

   ↓

Entrega

   ↓

Pagamento restante

```

Um projeto pode possuir vários ambientes:

```text

Projeto

│

├── Ambiente 1

│   └── Orçamento 1

│

├── Ambiente 2

│   └── Orçamento 2

│

└── Ambiente 3

    └── Orçamento 3

```

---

## 20. Principais regras de negócio

Entre as principais regras implementadas estão:

- um cliente pode possuir vários projetos;

- um projeto pode possuir vários ambientes;

- cada ambiente possui seu próprio orçamento;

- não é permitido criar orçamento duplicado para o mesmo ambiente;

- orçamento vencido não pode ser aprovado;

- somente orçamento aprovado pode gerar pedido;

- não é permitido criar pedido duplicado para o mesmo orçamento;

- produção exige pelo menos 30% do pedido pago;

- produção verifica a disponibilidade dos materiais;

- saída de estoque não pode ultrapassar a quantidade disponível;

- entrada de estoque aumenta a quantidade disponível;

- saída de estoque reduz a quantidade disponível;

- movimentações de estoque são mantidas para preservar o histórico;

- cancelamento da produção devolve materiais ao estoque;

- produção iniciada ou concluída não pode ser excluída;

- quando a produção é entregue, o pedido também é marcado como entregue;

- pagamentos podem ser parciais;

- não é permitido registrar pagamento superior ao valor do pedido;

- a entrega não depende da quitação total do pedido;

- materiais utilizados em assistência são controlados pelo estoque;

- exclusão de assistência devolve os materiais utilizados ao estoque;

- substituição de materiais necessita de aprovação;

- materiais com quantidade igual ou inferior ao estoque mínimo são identificados como estoque baixo;

- relatórios apresentam informações consolidadas dos módulos do sistema.

---

## 21. Testes realizados

Durante o desenvolvimento foram realizados testes manuais dos principais fluxos da aplicação.

Foram testados:

- autenticação;

- cadastro de clientes;

- atualização de clientes;

- exclusão de clientes;

- cadastro de projetos;

- atualização de projetos;

- cadastro de ambientes;

- atualização de ambientes;

- criação de orçamentos;

- aprovação e reprovação de orçamentos;

- controle de validade dos orçamentos;

- criação de pedidos;

- controle de pedidos duplicados;

- alterações de status dos pedidos;

- criação de produção;

- controle do pagamento mínimo de 30%;

- controle de estoque na produção;

- cancelamento de produção;

- devolução de materiais ao estoque;

- entrada de materiais;

- saída de materiais;

- bloqueio de saída superior ao estoque;

- bloqueio da exclusão de movimentações;

- pagamentos parciais;

- pagamentos totais;

- controle de valores pagos;

- assistência técnica;

- controle de garantia;

- utilização de materiais na assistência;

- devolução de materiais após exclusão da assistência;

- solicitação de substituição de materiais;

- aprovação e recusa de substituições;

- relatórios financeiros;

- relatório de estoque;

- relatório de produção;

- relatório de pedidos;

- relatório de assistência;

- relatório geral do sistema.

A aplicação foi compilada e executada localmente utilizando **Java 21**, **Spring Boot** e **MySQL 8.4 em Docker**.

---

## 22. Execução durante o desenvolvimento

O projeto pode ser executado no ambiente de desenvolvimento utilizando WSL, Docker e Java 21.

Entre na pasta do projeto:

```bash

cd /mnt/c/Users/wuesley/OneDrive/Imagens/Desktop/TCC/marcenariapro

```

Inicie o banco:

```bash

docker compose up -d

```

Execute a aplicação:

```bash

./mvnw spring-boot:run

```

A aplicação estará disponível em:

```text

http://localhost:8080

```

---

## 23. Compilação

Para verificar a compilação do projeto:

```bash

./mvnw clean compile

```

Para executar os testes automatizados, quando disponíveis:

```bash

./mvnw test

```

---

## 24. Banco de dados

O sistema utiliza o MySQL 8.4.

Configurações principais utilizadas no ambiente de desenvolvimento:

```text

Banco: marcenariapro

Host: localhost

Porta: 3306

```

O Hibernate/JPA é responsável pelo mapeamento das entidades Java para as tabelas do banco.

Durante o desenvolvimento, a aplicação utiliza:

```properties

spring.jpa.hibernate.ddl-auto=update

```

Essa configuração permite que o Hibernate atualize a estrutura das tabelas conforme as entidades da aplicação.

---

## 25. Segurança

A aplicação utiliza:

- Spring Security;

- autenticação JWT;

- senha armazenada utilizando mecanismo de hash;

- controle de acesso por perfil;

- autenticação nas rotas protegidas.

O token JWT deve ser enviado através do cabeçalho:

```text

Authorization: Bearer <token>

```

---

## 26. Integração com o frontend

O backend disponibiliza uma API REST para integração com o frontend do MarcenariaPro.

A aplicação frontend poderá consumir os endpoints utilizando:

```text

http://localhost:8080

```

Os principais módulos disponíveis para integração são:

```text

/auth

/usuarios

/clientes

/projetos

/ambientes

/orcamentos

/pedidos

/producoes

/materiais

/movimentacoes-estoque

/pagamentos

/assistencias-tecnicas

/solicitacoes-substituicao

/relatorios

```

---

## 27. Próximo passo

Com o backend estruturado e os principais fluxos testados, o próximo passo do projeto é o desenvolvimento do **frontend do MarcenariaPro**.

A interface deverá integrar os endpoints disponibilizados pelo backend e contemplar os principais módulos do sistema:

- Login;

- Dashboard;

- Clientes;

- Projetos;

- Ambientes;

- Orçamentos;

- Pedidos;

- Produção;

- Estoque;

- Pagamentos;

- Assistência técnica;

- Relatórios;

- Usuários e configurações administrativas.

28. Configuração da chave JWT no ambiente local

A aplicação utiliza JWT para autenticar os usuários. Para assinar e validar os tokens, o backend precisa de uma chave secreta configurada na variável de ambiente JWT_SECRET.

A chave deve possuir pelo menos 32 bytes (256 bits) para utilização com HS256. Não confunda 32 bytes com 32 bits.

O JwtService deste projeto utiliza secret.getBytes(StandardCharsets.UTF_8). Portanto, a chave é utilizada como texto UTF-8, sem decodificação Base64.

Linux / macOS / terminal Git Bash

Na raiz do backend, gere uma chave aleatória com OpenSSL:

openssl rand -base64 32

Copie o resultado e configure a variável no mesmo terminal em que iniciará o Spring Boot:

export JWT_SECRET="COLE_AQUI_A_CHAVE_GERADA"

export SPRING_PROFILES_ACTIVE=local

Em seguida, inicie a aplicação:

./mvnw spring-boot:run

Windows PowerShell

Gere a chave:

openssl rand -base64 32

Configure as variáveis no PowerShell, substituindo o texto pela chave gerada:

Env: Jwt Secret = "COLE_AQUI_A_CHAVE_GERADA"

Env: Spring Profiles Active = "local"

Inicie o backend:

.\mvnw.cmd spring-boot:run

Configuração no application.properties

A propriedade utilizada pelo JwtService deve apontar para a variável de ambiente:

app.jwt.secret=${JWT_SECRET}

Importante:

Gere uma chave própria para cada ambiente.

Não publique a chave no GitHub.

Não envie a chave para colegas ou para a banca.

Não coloque a chave diretamente no código-fonte.

A variável exportada no terminal fica disponível para os processos iniciados a partir daquele terminal. Se abrir outro terminal, configure-a novamente.

A chave local não precisa ser igual à chave configurada no Railway.

Não altere a chave JWT de produção apenas para realizar os testes locais. Tokens assinados com a chave antiga deixarão de ser válidos após uma troca.

29. Usuários para demonstração na banca

Caso o projeto contenha a classe AdminInicializador anotada com @Profile("local"), ela poderá criar usuários de demonstração automaticamente no banco local.

As credenciais de acesso ao sistema, incluindo os usuários de demonstração e suas respectivas senhas, serão disponibilizadas em um documento PDF anexo, enviado juntamente com este README para consulta da banca avaliadora.

Por segurança, os logins e as senhas não são apresentados diretamente neste documento.

As contas de demonstração somente serão criadas se o inicializador correspondente estiver presente no código e o perfil local estiver ativo. Caso contrário, os usuários deverão ser cadastrados pelo fluxo administrativo disponível no sistema.

As credenciais disponibilizadas no PDF são destinadas exclusivamente à avaliação em ambiente local e não devem ser utilizadas em produção.

30. Roteiro de preparação e testes para a banca

Recomenda-se realizar os seguintes passos antes da apresentação ou avaliação do projeto.

30.1 Preparar o ambiente

Clonar o repositório:

git clone https://github.com/wuesley-soares/marcenariapro-front.git

cd marcenariapro

Iniciar o banco de dados:

docker compose up -d

Verificar se o container está em execução:

docker ps

Configurar JWT_SECRET e SPRING_PROFILES_ACTIVE=local, conforme a seção 28.

Iniciar o backend:

./mvnw spring-boot:run

No Windows, utilizar:

.\mvnw.cmd spring-boot:run

Iniciar o frontend em outro terminal, seguindo as instruções do repositório do frontend. Verificar se a variável VITE_API_URL aponta para a API local:

VITE_API_URL=http://localhost:8080

30.2 Verificar autenticação e autorização

Realizar login com um usuário válido.

Verificar se a API retorna o token JWT.

Acessar uma rota protegida enviando Authorization: Bearer <token>.

Tentar acessar uma rota protegida sem token e verificar se o acesso é negado.

Testar as permissões dos perfis ADMIN, VENDEDOR e MARCENEIRO, respeitando as regras definidas nos controllers.

Verificar se um usuário inativo não consegue autenticar ou utilizar um token.

30.3 Testar os principais fluxos do sistema

Cadastrar um cliente.

Criar um projeto e seus ambientes.

Criar um orçamento e verificar sua validade.

Aprovar um orçamento válido e gerar um pedido.

Registrar pagamentos parciais.

Verificar a regra de pagamento mínimo de 30% antes do início da produção.

Conferir a reserva e a movimentação de materiais no estoque.

Atualizar o status da produção e verificar os reflexos no pedido.

Consultar os registros de assistência técnica e os relatórios disponíveis.

Os testes devem respeitar os pré-requisitos e as regras de negócio implementadas em cada módulo. Não apresentar como testada uma funcionalidade que ainda não tenha sido executada e verificada.

30.4 Cuidados durante a avaliação

Utilizar exclusivamente o banco local do Docker para os testes da banca.

Utilizar dados fictícios, sem informações reais de clientes.

Não compartilhar variáveis secretas nem credenciais de produção.

Não executar docker compose down -v se desejar preservar os dados cadastrados durante os testes, pois esse comando remove os volumes do banco.

Para parar os containers sem apagar os dados, utilizar:

docker compose down

Reservar tempo antes da apresentação para iniciar o Docker, o backend e o frontend e verificar o login.





