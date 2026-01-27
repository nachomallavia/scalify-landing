import type { BlogPost } from "@/types/blog";

export default function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <section className="px-6 py-10 lg:py-16">
      <div className="container px-0">
        <a href={`/blog/${post.slug}`}>
          <article className="bg-accent p-5 lg:p-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
              <div className="flex flex-col justify-between lg:p-6">
                <div>
                  {!!post.tagline && (
                    <span className="text-tagline text-md">{post.tagline}</span>
                  )}
                  <h1 className="text-foreground mt-3 text-[32px] leading-[1.25] tracking-tight lg:text-[36px]">
                    {post.title}
                  </h1>
                  {!!post.description && (
                    <p className="text-muted-foreground mt-3 max-w-[640px]">
                      {post.description}
                    </p>
                  )}
                  <div className="text-muted-foreground mt-4 flex items-center gap-3">
                    <img
                      src="/images/homepage/testimonials/1.webp"
                      alt=""
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="text-sm">{post.author}</span>
                    <span className="text-sm">•</span>
                    <span className="text-sm">
                      {post.date
                        ? new Date(post.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative aspect-[10/9] w-full max-w-[500px] lg:aspect-auto lg:h-[450px] lg:w-[500px]">
                  <img
                    src={post.coverImage || "/images/blog/placeholder.webp"}
                    alt={post.title}
                    className="absolute inset-0 h-full w-full rounded-xl object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </article>
        </a>
      </div>
    </section>
  );
}
