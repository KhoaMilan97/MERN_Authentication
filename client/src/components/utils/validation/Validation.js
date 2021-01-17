export const isEmpty = (value) => {
  if (value.length === 0) return true;
  return false;
};

export const isEmail = (value) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(value);
};

export const lengthPassword = (value) => {
  if (value.length < 6) return true;
  return false;
};

export const isMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) return true;
  return false;
};
