import { serverCmsApi, type BlogPost } from '../../../lib/server-api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Footer } from '../../../components/Footer';
import { Home, ChevronRight } from 'lucide-react';
import { Metadata } from 'next';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
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
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50)
    .replace(/^-+|-+$/g, ''); // 移除开头和结尾的连字符
}

// 截取标题用于面包屑导航
function truncateTitle(title: string, maxLength: number = 50): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + '...';
}

// 格式化时间戳为可读日期
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 预估阅读时间
function estimateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, ''); // 移除HTML标签
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readingTime} min`;
}

// 获取单篇博客文章
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const blogResponse = await serverCmsApi.getBlogList(1, 100, 0);

    // 通过比较slug来查找对应的文章
    const post = blogResponse.list.find(p => generateSlug(p.title, p.url) === slug);

    console.log('App Router: Successfully fetched blog post:', post?.title);
    return post || null;
  } catch (error) {
    console.error('App Router: Failed to fetch blog post:', error);
    return null;
  }
}

// 生成动态metadata
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }

  return {
    title: post.seo_name || post.title,
    description: post.seo_desc || post.abstract || `Read about ${post.title} on Seedance Pro blog.`,
    openGraph: {
      title: post.seo_name || post.title,
      description: post.seo_desc || post.abstract || `Read about ${post.title} on Seedance Pro blog.`,
      type: 'article',
      publishedTime: new Date(post.created_time * 1000).toISOString(),
      authors: ['Seedance Pro Team'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_name || post.title,
      description: post.seo_desc || post.abstract || `Read about ${post.title} on Seedance Pro blog.`,
    },
    keywords: ['Seedance Pro', 'blog', 'AI video', 'Wan 2.2', post.title],
    authors: [{ name: 'Seedance Pro Team' }],
    category: 'Technology',
  };
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section（用于面包屑和标题） */}
      <div className="pt-24 pb-12 bg-transparent">
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
              <Link
                title="Seedance Blog"
                href="/blog"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Seedance Blog
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              <span className="text-foreground font-medium">
                {truncateTitle(post.title)}
              </span>
            </nav>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground mb-6">
            <span>Seedance Team</span>
            <span>•</span>
            <span>{formatDate(post.created_time)}</span>
            <span>•</span>
            <span>{estimateReadingTime(post.content)}</span>
          </div>
        </div>
      </div>
      {/* 主内容区 */}
      <div className="container mx-auto px-6 max-w-7xl">
        <article>
          <div className="prose prose-lg mx-auto max-w-7xl ">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-6 text-foreground" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-4 text-foreground" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-3 text-foreground" {...props} />,
                h4: ({ node, ...props }) => <h4 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props} />,
                p: ({ node, ...props }) => <p className="text-muted-foreground mb-4 leading-relaxed" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                li: ({ node, ...props }) => <li className="text-muted-foreground" {...props} />,
                a: ({ node, ...props }) => <a className="text-primary hover:underline transition-colors" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground bg-secondary/20" {...props} />,
                code: ({ node, ...props }) => <code className="bg-secondary px-2 py-1 rounded text-sm font-mono" {...props} />,
                pre: ({ node, ...props }) => <pre className="bg-secondary p-4 rounded-lg overflow-x-auto my-4" {...props} />,
                hr: ({ node, ...props }) => <hr className="border-0 border-t border-gray-300 my-8" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                em: ({ node, ...props }) => <em className="italic" {...props} />,
                // 表格支持
                table: ({ node, ...props }) => <table className="w-full border-collapse border border-muted mb-6" {...props} />,
                thead: ({ node, ...props }) => <thead className="bg-muted/50" {...props} />,
                tbody: ({ node, ...props }) => <tbody {...props} />,
                tr: ({ node, ...props }) => <tr className="border-b border-muted hover:bg-muted/30" {...props} />,
                th: ({ node, ...props }) => <th className="border border-muted px-4 py-2 text-left font-semibold text-foreground" {...props} />,
                td: ({ node, ...props }) => <td className="border border-muted px-4 py-2 text-muted-foreground" {...props} />,
                // 图片支持
                img: ({ node, ...props }) => (
                  <span className="block my-8">
                    <img
                      {...props}
                      className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200/50 mx-auto block"
                      loading="lazy"
                      alt={props.alt || 'Blog image'}
                    />
                  </span>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// 生成静态参数
export async function generateStaticParams() {
  try {
    const blogResponse = await serverCmsApi.getBlogList(1, 100, 0);

    return blogResponse.list.map((post) => ({
      slug: generateSlug(post.title, post.url),
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// App Router的ISR配置
export const revalidate = 3600; // 每小时重新验证一次 