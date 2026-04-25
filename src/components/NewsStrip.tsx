import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useNews, NewsCard, NewsSkeleton } from "@/pages/News";
import { useT } from "@/i18n/I18nProvider";

export function NewsStrip() {
  const { t } = useT();
  const { articles, loading } = useNews("all");
  const items = articles.slice(0, 8);

  return (
    <section className="container py-12 md:py-20">
      <div className="flex items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight">
            {t("Latest")} <span className="gradient-text">{t("Election News")}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("Stay informed before you vote.")}
          </p>
        </div>
        <Link to="/news" className="btn-ghost-3d !min-h-[40px] !py-2 hidden sm:inline-flex">
          {t("View all")} <ArrowRight size={16} />
        </Link>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <NewsSkeleton key={i} />)
          : items.map((a, i) => <NewsCard key={a.url ?? i} a={a} t={t} />)}
      </div>

      <div className="sm:hidden mt-4">
        <Link to="/news" className="btn-ghost-3d w-full">
          {t("View all news")} <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
