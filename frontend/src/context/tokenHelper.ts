let _accessToken: string | null = null;

export const setAccessToken = async (token: string | null) => {
  _accessToken = token;
};

export const getAccessToken = async (): Promise<string | null> => {
  return _accessToken;
};
