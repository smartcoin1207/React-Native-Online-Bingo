// ValidationUtils.tsx
import * as Validations from './ValidationString';

export const validateEmail = (email: string): string | null => {
    if (!email) {
      return Validations.emailRequired;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      return Validations.invalidEmailFormat;
    }
    return null;
  };
  
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return Validations.passwordRequired;
  } else if (password.length < 6) {
    return Validations.passwordLength;
  } else if (!/^[a-zA-Z0-9]+$/.test(password)) {
    return Validations.passwordPattern;
  }
  return null;
};

export const validateUsername = (username: string): string | null => {
  if (!username) {
    return Validations.nameRequired;
  }

  return null;
};


export const validateRoomPassword = (password: string): string | null => {
  if (!password) {
    return Validations.passwordRequired;
  }

  return null;
};

export const validateRoomTitle = (title: string): string | null => {
  if (!title) {
    return Validations.titleRequired;
  }

  return null;
};
