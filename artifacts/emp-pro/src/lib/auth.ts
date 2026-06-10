export const getToken = () =>
  typeof localStorage !== "undefined" ? localStorage.getItem("emp_pro_token") : null;

export const setToken = (token: string) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("emp_pro_token", token);
    window.dispatchEvent(new Event("emp_pro_auth_change"));
  }
};

export const removeToken = () => {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("emp_pro_token");
    window.dispatchEvent(new Event("emp_pro_auth_change"));
  }
};
