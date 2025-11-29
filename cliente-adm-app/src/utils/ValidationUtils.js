/**
 * Validadores comuns para a aplicação
 */

export class ValidationUtils {
  /**
   * Valida se o ID está no formato UUID
   */
  static validarUUID(id) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Valida se o email tem formato válido
   */
  static validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida se o CPF tem formato válido (formato simples)
   */
  static validarCPF(cpf) {
    if (!cpf) return false;

    // Remove caracteres não numéricos
    const cpfLimpo = cpf.replace(/\D/g, "");

    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) return false;

    // Verifica se não são todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

    return true;
  }

  /**
   * Valida se a senha atende aos critérios mínimos
   */
  static validarSenha(senha) {
    if (!senha || senha.length < 6) return false;
    return true;
  }
}

export default ValidationUtils;
