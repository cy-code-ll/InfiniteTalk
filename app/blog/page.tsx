import { serverCmsApi, BlogPost } from "../../lib/server-api";
import Link from "next/link";
import { Metadata } from "next";
import { Footer } from "../../components/Footer";
import { Home, ChevronRight } from "lucide-react";

// 页面metadata配置
export const metadata: Metadata = {
  title: "Seedance AI Video Generator Blog",
  description:
    "Read the latest posts on Seedance AI video generation. Get tips, inspiration, feature updates, and creative use cases.",
  keywords: "Seedance blog, AI video tips, AI video ideas, AI video updates",
  openGraph: {
    title: "Seedance AI Video Generator Blog",
    description:
      "Read the latest posts on Seedance AI video generation. Get tips, inspiration, feature updates, and creative use cases.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seedance AI Video Generator Blog",
    description:
      "Read the latest posts on Seedance AI video generation. Get tips, inspiration, feature updates, and creative use cases.",
  },
};

// App Router中的数据获取函数
async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const blogResponse = await serverCmsApi.getBlogList(1, 20, 0);
    console.log(
      "App Router: Successfully fetched blog posts:",
      blogResponse.list.length
    );
    return blogResponse.list;
  } catch (error) {
    console.error("App Router: Failed to fetch blog posts:", error);
    return [];
  }
}

// 格式化时间戳为可读日期
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// 生成文章slug
function generateSlug(title: string, url?: string): string {
  // 如果 url 字段存在且包含连字符，直接使用
  if (url && url.includes('-')) {
    return url.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, ''); // 移除开头和结尾的连字符
  }
  
  // 否则使用原来的生成方式
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50)
    .replace(/^-+|-+$/g, ''); // 移除开头和结尾的连字符
}

// 预估阅读时间
function estimateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, ""); // 移除HTML标签
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readingTime} min`;
}

export default async function Blog() {
  // 在App Router中直接获取数据
  const blogPosts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-muted/20 to-primary/5 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Breadcrumb Navigation */}
          <div className="mb-12">
            <nav className="flex items-center space-x-2 text-sm">
              <Link 
                title="Seedance Pro"
                href="https://www.seedancepro.com/" 
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <Home className="w-4 h-4" />
                Seedance Pro
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              <span className="text-foreground font-medium">
                Seedance Blog
              </span>
            </nav>
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-nunito bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Seedance AI Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover insights, tutorials, and updates about AI video generation
              and creative technology
            </p>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              seedance 1.0 exploring the boundaries of video generation models
            </p>
          </div>
        </div>
      </div>

      {/* Blog Posts Section */}
      <div className="container mx-auto px-6 py-16">
        {blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {blogPosts.map((post) => (
              <Link href={`/blog/${generateSlug(post.title, post.url)}`} key={post.id}>
                <article className="group bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-border overflow-hidden hover:-translate-y-2">
                  {/* Article Header */}
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-xs font-medium text-primary uppercase tracking-wider">
                        Article
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold mb-4 text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
                      {post.title}
                    </h2>

                    <p className="text-muted-foreground text-base mb-6 line-clamp-3 leading-relaxed">
                      {post.abstract}
                    </p>

                    {/* Article Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            V
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            Seedance Team
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(post.created_time)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform duration-200">
                        <span className="text-sm font-medium">Read More</span>
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-primary/20 to-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              No Blog Posts Yet
            </h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We're working on creating amazing content for you. Check back
              soon!
            </p>
          </div>
        )}
      </div>

   

      {/* Footer */}
      <Footer />
    </div>
  );
}

// App Router的ISR配置
export const revalidate = 3600; // 每小时重新验证一次
