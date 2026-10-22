# MarcenariaPro — Sistema Web de Gestão para Marcenaria

## Sobre o projeto

O **MarcenariaPro** é um sistema web desenvolvido como parte do Trabalho de Conclusão de Curso (TCC) do curso de Tecnologia em Análise e Desenvolvimento de Sistemas do Instituto Federal do Paraná (IFPR) — Campus Cascavel.

O sistema tem como objetivo centralizar e facilitar o gerenciamento das atividades de uma marcenaria de pequeno porte, reunindo informações que podem ser utilizadas no acompanhamento dos clientes, projetos, orçamentos, pedidos, produção, estoque e pagamentos.

A aplicação está sendo desenvolvida para uso interno, por administradores e funcionários da marcenaria.

## Tecnologias utilizadas

### Frontend
- React
- Vite
- JavaScript
- CSS
- Axios para comunicação com a API REST
- Recharts para a construção de gráficos, quando integrado às telas correspondentes

### Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Spring Security e JWT para autenticação e segurança
- API REST

### Banco de dados e ambiente
- MySQL
- Docker para execução do banco de dados em ambiente de desenvolvimento

## Funcionalidades do sistema

O projeto contempla os seguintes módulos:

- **Dashboard:** visualização resumida de informações do sistema.
- **Clientes:** cadastro, consulta, edição e exclusão de clientes.
- **Projetos:** gerenciamento dos projetos vinculados aos clientes.
- **Ambientes:** organização dos ambientes que fazem parte de cada projeto.
- **Orçamentos:** elaboração e acompanhamento dos orçamentos.
- **Pedidos:** gerenciamento dos pedidos gerados a partir dos orçamentos.
- **Produção:** acompanhamento das etapas de produção.
- **Estoque:** controle dos materiais cadastrados e de suas quantidades.
- **Pagamentos:** registro e acompanhamento dos pagamentos.
- **Assistência Técnica:** organização dos atendimentos e serviços de assistência.
- **Relatórios:** consulta de informações para acompanhamento das atividades.

A disponibilidade de cada funcionalidade depende da etapa atual de implementação do sistema.

## Arquitetura

O MarcenariaPro utiliza uma arquitetura separada em frontend, backend e banco de dados.

```text
Usuário
   |
   v
Frontend — React + Vite
   |
   | Requisições HTTP / API REST
   v
Backend — Spring Boot
   |
   | JPA / Hibernate
   v
Banco de dados — MySQL
```

O frontend é responsável pela interface com o usuário. O backend processa as requisições, aplica as regras de negócio e realiza a comunicação com o banco de dados.

## Requisitos para execução

Para executar o projeto localmente, são necessários:

- Node.js e npm;
- Git, caso o projeto seja obtido por meio do repositório;
- backend do MarcenariaPro configurado e em execução;
- banco de dados MySQL configurado conforme as propriedades do backend.

O Docker pode ser utilizado para executar o banco de dados, conforme a configuração do projeto.

## Como executar o frontend

### 1. Obter o projeto

Clone o repositório do frontend:

```bash
git clone https://github.com/wuesley-soares/marcenariapro-front.git
```

Entre na pasta do projeto:

```bash
cd marcenariapro-front
```


### 2. Instalar as dependências

Execute:

```bash
npm install
```

### 3. Configurar a API

O frontend precisa se comunicar com o backend para consultar e registrar informações.

Verifique o arquivo de configuração da API, localizado normalmente em `src/services/api.js` ou no caminho utilizado pelo projeto.

Caso o backend esteja sendo executado localmente na porta `8080`, o endereço-base poderá ser:

```text
http://localhost:8080
```

Utilize o endereço correspondente ao ambiente em que o backend estiver sendo executado. Se o projeto utilizar variáveis de ambiente, configure-as conforme a implementação existente.

### 4. Iniciar o frontend

Execute:

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local para acessar a aplicação. Normalmente, ele é:

```text
http://localhost:5173
```

Abra o endereço informado pelo terminal no navegador.

### 5. Gerar a versão de produção

Para verificar se o frontend pode ser compilado, execute:

```bash
npm run build
```

Os arquivos gerados ficam normalmente na pasta `dist`.

Para visualizar a versão compilada localmente, execute:

```bash
npm run preview
```

## Execução do backend

O frontend depende do backend para funcionar corretamente com dados persistidos.

O backend deve estar configurado com:
- Java 21;
- Maven;
- conexão com o banco de dados MySQL;
- propriedades de acesso ao banco e demais configurações necessárias;
- autenticação e demais serviços exigidos pela aplicação.

O backend pode ser iniciado a partir de sua pasta de projeto, conforme a configuração do repositório. Em projetos Maven com Spring Boot, o comando normalmente utilizado é:

```bash
./mvnw spring-boot:run
```

No Windows, quando disponível, também é possível utilizar:

```powershell
.\mvnw.cmd spring-boot:run
```

Esses comandos pressupõem que o projeto contenha o Maven Wrapper e esteja devidamente configurado.

## Situação atual do projeto

O MarcenariaPro está em desenvolvimento. A implementação das funcionalidades ocorre de forma progressiva, e o funcionamento integrado precisa ser verificado no ambiente de execução utilizado.

A etapa de testes no ambiente real da marcenaria será realizada após a conclusão das funcionalidades previstas, com o objetivo de identificar possíveis ajustes e melhorias.

## Autor

**Wuesley Soares Maximiano**

Tecnologia em Análise e Desenvolvimento de Sistemas — IFPR, Campus Cascavel.

Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC).

## Licença

Projeto acadêmico. A utilização e a distribuição do código devem respeitar as condições definidas pelo autor e pelo repositório.
