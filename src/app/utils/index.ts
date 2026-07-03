import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export const passwordMatchValidator = (
  passwordKey: string = 'password',
  confirmPasswordKey: string = 'confirmPassword',
): ValidatorFn => {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey);
    const confirmPassword = group.get(confirmPasswordKey);

    if (!password || !confirmPassword) return null;

    if (confirmPassword.errors && !confirmPassword.errors?.['passwordMismatch']) return null;

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    confirmPassword.setErrors(null);
    return null;
  };
};

export const errorState = (
  formInputName: string,
  controls: Record<string, AbstractControl>,
): boolean => {
  const control = controls[formInputName];
  return control?.touched && control?.invalid;
};

export const getErrorMessage = (
  formInputName: string,
  controls: Record<string, AbstractControl>,
): string => {
  const control = controls[formInputName];

  if (!control || !control.touched || !control.errors) {
    return '';
  }

  if (control.errors['required']) {
    return `${formatFieldName(formInputName)} is required`;
  }

  if (control.errors['email']) {
    return `${formatFieldName(formInputName)} is not a valid email`;
  }

  if (control.errors['minlength']) {
    const minLength = control.errors['minlength'].requiredLength;
    return `${formatFieldName(formInputName)} must be at least ${minLength} characters`;
  }

  if (control.errors['min']) {
    const minValue = control.errors['min'].min;
    return `${formatFieldName(formInputName)} must be at least ${minValue}`;
  }

  if (control.errors['max']) {
    const maxValue = control.errors['max'].max;
    return `${formatFieldName(formInputName)} cannot exceed ${maxValue}`;
  }

  if (control.errors['pattern']) {
    return `${formatFieldName(formInputName)} format is invalid`;
  }

  if (control.errors['passwordMismatch']) {
    return 'Passwords do not match';
  }

  if (control.errors['trim']) {
    return `${formatFieldName(formInputName)} cannot be empty`;
  }

  return 'Invalid field';
};

export const errorArrayState = (
  fieldName: string,
  index: number,
  poll_options_array: AbstractControl[],
): boolean => {
  const control = poll_options_array.at(index)?.get(fieldName);
  return !!(control && control.touched && control.invalid);
};

export const arrayErrorMessage = (
  fieldName: string,
  index: number,
  poll_options_array: AbstractControl[],
): string => {
  const control = poll_options_array.at(index)?.get(fieldName);

  if (!control || !control.errors) {
    return '';
  }

  if (control.errors['required']) {
    return `${formatFieldName(fieldName)} is required`;
  }

  if (control.errors['minlength']) {
    const minLength = control.errors['minlength'].requiredLength;
    return `${formatFieldName(fieldName)} must be at least ${minLength} characters`;
  }

  if (control.errors['pattern']) {
    return `${formatFieldName(fieldName)} format is invalid`;
  }

  return 'Invalid field';
};
