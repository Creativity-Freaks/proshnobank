import { useQuery } from "@tanstack/react-query";
import { contentApi } from "@/lib/content-api";

/**
 * Returns dynamic content for a landing section, falling back to the
 * provided default when the DB row is missing or empty. This keeps the
 * UI working before the `site_content` table is seeded, and makes it
 * fully dynamic afterwards.
 */
export function useSiteContent<T>(key: string, fallback: T): { data: T; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ["site_content", key],
    queryFn: () => contentApi.get<T>(key),
    staleTime: 5 * 60_000,
  });

  const value =
    data && typeof data === "object" && Object.keys(data as object).length > 0 ? (data as T) : fallback;

  return { data: value, isLoading };
}
