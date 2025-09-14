export function setResponse(key: string, value: any) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(error);
  }
}

export function getResponse(key: string) {
  try {
    const response = window.localStorage.getItem(key);
    return response ? JSON.parse(response) : undefined;
  } catch (error) {
    console.error(error);
  }
}
