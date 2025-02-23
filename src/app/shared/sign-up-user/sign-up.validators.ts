import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Валидатор больше ли 0
export function minLength(): ValidatorFn {
  return (control: AbstractControl) => {
    if (control.value && typeof control.value === 'string') {
      return control.value.trim().length > 0 ? null : { minLength: true };
    }
    return { minLength: true };
  };
}
// Валидатор является ли вводимое значение цифрой и длина от 1 до 2
export function isNumber(): ValidatorFn {
  return (control: AbstractControl) => {
    if (Number(control.value)) {
      return control.value.trim().length <= 2 && control.value.trim().length > 1
        ? null
        : { isNumber: true };
    }
    return { isNumber: true };
  };
}

interface PhoneNumberValidationErrors {
  isBelarusPhoneNumber?: boolean;
  isRussiaPhoneNumber?: boolean;
}

// Валидатор для белорусских номеров
export function isBelarusPhoneNumber(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();
    if (!value || !value.match(/^\+375\d{9}$/)) {
      return { isBelarusPhoneNumber: true };
    }
    return null;
  };
}

// Валидатор для российских номеров
export function isRussiaPhoneNumber(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();
    if (!value || !value.match(/^\+7\d{10}$/)) {
      return { isRussiaPhoneNumber: true };
    }
    return null;
  };
}

// Основной валидатор, определяющий страну и применяющий нужный валидатор
export function isPhoneNumber(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();
    if (!value) {
      return { invalidInput: true }; // Возвращаем ошибку, если значение отсутствует
    }
    // Определим страну по начальным цифрам номера
    let validator: ValidatorFn;
    if (value.startsWith('+375')) {
      validator = isBelarusPhoneNumber(); // Применяем валидатор для Беларуси
    } else if (value.startsWith('+7')) {
      validator = isRussiaPhoneNumber(); // Применяем валидатор для России
    } else {
      return { invalidCountryCode: true }; // Неверный код страны
    }

    // Применяем выбранный валидатор
    return validator(control);
  };
}
