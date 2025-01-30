## Requisitos Funcionais:
### Requisito Funcional 1: Cadastro de Profissionais (Providers)
- [ ] Deve ser possível cadastrar providers com as seguintes informações: Nome, email, CPF, senha, data de nascimento, telefone, área de atuação, valor da consulta, duração da consulta, código profissional e descrição detalhada do serviço/especialidade.
Critérios de aceitação:
- [ ] O sistema deve validar o CPF, o email e o telefone
- [ ] O sistema deve exibir uma mensagem de sucesso (com um botão para fazer o login) ou de erro após cadastro

### Requisito Funcional 2: Login de Profissionais (Providers)
- [ ] Deve ser possível fazer o login como provider na aplicação
Critérios de aceitação:
- [ ] O sistema deve validar o email
- [ ] O sistema deve exibir uma mensagem de erro em caso de provider não cadastrado ou email/senha inválidos

### Requisito Funcional 3: Alterar senha do Profissional (Provider)
- [ ] Deve ser possível alterar a senha através do botão de esqueci a senha
Critérios de aceitação:
Só é possível alterar pelo link enviado para o email cadastrado
O sistema deve exibir uma mensagem de sucesso (com um botão para fazer o login) ou de erro após alteração

### Requisito Funcional 4: Edição dos dados do Profissional (Provider)
- [ ] Deve ser possível editar os dados do provider a qualquer momento.
Critérios de aceitação:
- [ ] CPF e email não podem ser alterados.

### Requisito Funcional 5: Criar Disponibilidades única
- [ ] O sistema deve permitir que o provider cadastre uma disponibilidade única no calendário e visualize as disponibilidades já cadastradas.
Critérios de aceitação:
- [ ] A duração da disponibilidade deve ser padronizada segundo a duração da consulta do provider

### Requisito Funcional 6: Criar Disponibilidades recorrente
- [ ] O sistema deve permitir que o provider cadastre uma disponibilidade recorrente semanal, mensal ou diária no calendário e visualize as disponibilidades já cadastradas.
Critérios de aceitação:
- [ ] A duração da disponibilidade deve ser padronizada segundo a duração da consulta do provider

### Requisito Funcional 7: Editar e excluir disponibilidades
- [ ] O sistema deve permitir que a disponibilidade seja editada ou excluída, sendo ela recorrente ou não.
Critérios de aceitação:
- [ ] A duração da disponibilidade não pode ser alterada

### Requisito Funcional 8: Visualizar agendamentos
- [ ] O sistema deve permitir que o provider visualize os agendamentos cadastrados no calendário e os dados do paciente ao clicar no agendamento.

### Requisito Funcional 9: Excluir agendamento
- [ ] O sistema deve permitir que o provider exclua um agendamento

### Requisito Funcional 10: Cadastrar Paciente
- [ ] O sistema deve permitir o cadastro de novos pacientes com os campos: nome, email, CPF, senha, data de nascimento e telefone e exibir uma mensagem de sucesso ou erro após o cadastro.
Critérios de aceitação:
- [ ] Deve permitir apenas um cadastro por email ou cpf.

### Requisito Funcional 10: Visualizar Médicos Cadastrados
- [ ] O sistema deve exibir os médicos cadastrados e um link para sua agenda de disponibilidades de horários

### Requisito Funcional 11: Agendar consulta
- [ ] O sistema deve permitir o agendamento de uma consulta com um médico em data e horário selecionados
Critérios de aceitação:
- [ ] Deve permitir o agendamento de pacientes cadastrados.
- [ ] Deve permitir o agendamento por parte da clínica inserindo os dados do paciente.

### Requisito Funcional 12: Vincular e desvincular providers na clínica
- [ ] O sistema deve permitir que a clínica vincule e desvincule um ou mais providers à ela.
Critérios de aceitação: 
- [ ] O sistema deve exibir uma mensagem de sucesso ou erro após vinculação ou desvinculação.
- [ ] Deve ser enviado um email de confirmação para o provider aceitar a vinculação.

### Requisito Funcional 13: Visualizar agendamentos da clínica
- [ ] O sistema deve permitir que a clínica visualize todos os agendamentos dos médicos vinculados a ela.

### Requisito Funcional 13: Excluir agendamentos da clínica
- [ ] O sistema deve permitir que a clínica exclua um agendamento que esteja vinculado a ela



## Regras de Negócio:
### Só deve ser possível realizar um agendamento após a confirmação de que o email e ou mensagem de whatsapp foi enviado para ambas as partes.

## Requisitos não funcionais:
### Ao realizar um agendamento, um email e uma mensagem de whatsapp devem ser disparados para o provider e para o paciente com os detalhes do agendamento


Como deve ser gerenciado as especialidades dos médicos