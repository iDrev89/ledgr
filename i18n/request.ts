import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Get locale from cookies, default to 'en'
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "es";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
