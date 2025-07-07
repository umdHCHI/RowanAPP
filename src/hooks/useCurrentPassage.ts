import { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import { StoryProgress } from "../types/story";

export const usePassageFetcher = (
  storyId: string,
  passageId: string | undefined = undefined
) => {
  const [data, setData] = useState<any>(null);
  const [progress, setProgress] = useState<StoryProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!storyId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log("=== FETCHING PASSAGE ===");
    console.log("Story ID:", storyId);
    console.log("Passage ID:", passageId);
      apiService
      .getPassage(parseInt(storyId), passageId)
      .then((res) => {
        console.log("Passage fetch response:", res);
        console.log("Response type:", typeof res);
        console.log("Response keys:", res ? Object.keys(res) : "No keys");
        
        // Check what kind of response we got
        if (res?.content) {
          console.log("Found content in response:", res.content?.substring(0, 100) + "...");
        }
        if (res?.passage_id) {
          console.log("Found passage_id:", res.passage_id);
        }
        if (res?.choices) {
          console.log("Found choices count:", res.choices?.length);
        }
        
        setData(res);
        setError(null);
      })
      .catch((err) => {
        console.error("Passage fetch error:", err);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        setError(`Failed to load passage: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [storyId, passageId]);  return {
    passage: data?.passage || (data?.content ? data : null) || data?.passages || null,
    story: data?.story || data?.category || null,
    progress: data?.progress || progress?.progress_percentage || null,
    loading,
    error,
  };
};
