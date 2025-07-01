import { useEffect, useState } from "react";
import { StoryDetail } from "../services/archiveService";
import { archiveService } from "../services/archiveService";

export const usePassageFetcher = (
  storyId: string,
  passageId: string | undefined = undefined
) => {
  const [data, setData] = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    archiveService
      .getPassage(storyId, passageId)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load passage.");
      })
      .finally(() => setLoading(false));
  }, [storyId, passageId]);

  return {
    passage: data?.passage || null,
    story: data?.story || null,
    progress: data?.progress || null,
    loading,
    error,
  };
};
