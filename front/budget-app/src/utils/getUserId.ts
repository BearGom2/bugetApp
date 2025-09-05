export const getUserId = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user?.id || null;
};
