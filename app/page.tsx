// import { Navbar } from '../components/Navbar'; // Navbar is now in root layout

import PricingSection from '../components/PricingSection';
import { Footer } from '../components/Footer';
import { serverCmsApi, FriendLink } from '../lib/server-api';
import { GoogleOneTapAuth } from '../components/auth';
// 启用ISR，每小时重新验证数据
export const revalidate = 1200;


export default async function Home() {
  // 获取友情链接数据，如果为空则使用默认数据
  let friendlyLinks = await serverCmsApi.getFriendLinkList();

  // 如果API返回空数据或失败，使用默认数据
  if (!friendlyLinks || friendlyLinks.length === 0) {
    console.log('Using default friend links as fallback');
    friendlyLinks = [];
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Google One Tap 组件 - 只在用户未登录时显示 */}
      {/* <GoogleOneTapAuth
        cancelOnTapOutside={true}
        signInForceRedirectUrl="/"
        signUpForceRedirectUrl="/"
      /> */}
      <main className="flex-grow">
        {/* <PricingSection /> */}
      </main>
      <Footer friendlyLinks={friendlyLinks} />
    </div>
  );
}
