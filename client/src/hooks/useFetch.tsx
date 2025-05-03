import { useEffect, useState } from "react";


const API_KEY = import.meta.env.VITE_GIPHY_API;

export const useFetch = ({ keyword }: { keyword: string }) => {
  const [gifUrl, setGifUrl] = useState("");

  const fetchGifs = async () => {
    try {                                   
      const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${keyword.split(" ").join("")}&limit=1`);
      const {data} = await response.json();

      setGifUrl(data[0]?.images?.downsized_medium.url);
    } catch (error) {
      setGifUrl("https://www.giphy.com/embed/14uQ3cOFteDaU");
    }
  }

  useEffect(() => {
    if (keyword) fetchGifs();
  }, [keyword]);

  return gifUrl;
}