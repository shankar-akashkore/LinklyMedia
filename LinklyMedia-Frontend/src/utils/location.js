export const extractPlaceFromGoogleUrl = (url) => {
    try {
      const params = new URL(url).searchParams;
      return params.get("q")?.replace(/\+/g, " ");
    } catch {
      return null;
    }
  };