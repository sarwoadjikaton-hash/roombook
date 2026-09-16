export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  errorMessage?: string;
}

/**
 * Validasi aturan kata sandi:
 * 1. Minimal 8 karakter
 * 2. Mengandung huruf besar / capslock (A-Z)
 * 3. Mengandung angka numerik (0-9)
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const clean = password.trim();
  const hasMinLength = clean.length >= 8;
  const hasUppercase = /[A-Z]/.test(clean);
  const hasNumber = /[0-9]/.test(clean);

  const isValid = hasMinLength && hasUppercase && hasNumber;

  let errorMessage: string | undefined;
  if (!clean) {
    errorMessage = 'Kata sandi wajib diisi.';
  } else if (!hasMinLength) {
    errorMessage = 'Kata sandi minimal harus 8 karakter.';
  } else if (!hasUppercase) {
    errorMessage = 'Kata sandi harus mengandung minimal 1 huruf besar / kapital (Capslock A-Z).';
  } else if (!hasNumber) {
    errorMessage = 'Kata sandi harus mengandung minimal 1 angka numerik (0-9).';
  }

  return {
    isValid,
    hasMinLength,
    hasUppercase,
    hasNumber,
    errorMessage,
  };
};
