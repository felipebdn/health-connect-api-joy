export function validatorCPF(value: string) {
  // Remover caracteres não numéricos
  const cpf = value.replace(/[^\d]/g, '')

  // Verificar se o CPF possui 11 dígitos
  if (cpf.length !== 11) {
    return false
  }

  // Verificar se todos os dígitos são iguais, o que tornaria o CPF inválido
  if (/^(\d)\1+$/.test(cpf)) {
    return false
  }

  // Calcular os dígitos verificadores
  let soma = 0
  let resto: number

  for (let i = 1; i <= 9; i++) {
    soma += Number.parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }

  resto = (soma * 10) % 11

  if (resto === 10 || resto === 11) {
    resto = 0
  }

  if (resto !== Number.parseInt(cpf.substring(9, 10))) {
    return false
  }

  soma = 0

  for (let i = 1; i <= 10; i++) {
    soma += Number.parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }

  resto = (soma * 10) % 11

  if (resto === 10 || resto === 11) {
    resto = 0
  }

  if (resto !== Number.parseInt(cpf.substring(10, 11))) {
    return false
  }

  return true
}
