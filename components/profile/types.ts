// 友情链接数据类型定义
export interface FriendLink {
  id: number;
  name: string;
  url: string;
  is_bright: number;
  desc: string;
  image: string;
  web_type: number;
  sort: number;
  appid: string;
  created_time: number;
}

// 定义从API获取的用户信息类型
export interface UserApiInfo {
  uuid: string;
  email: string;
  from_login: string;
  nickname: string;
  avatar?: string;
  free_limit: number;
  remaining_limit: number;
  total_limit: number;
  use_limit: number;
  vip_last_time: number;
  level: number;
  created_at: number;
  updated_at: number;
  status: number;
  id: number;
}

// 定义图片历史记录项的类型
export interface GenerationHistoryItem {
  id: number;
  user_id: number;
  task_id: string;
  origin_image: string;
  size_image: string;
  other_image: string;
  generate_image: string;
  quality_image: string;
  status: number;
  status_msg: string;
  generation_time: number;
  prompt: string;
  created_at: number;
  updated_at: number;
  model?: string;
}

// 定义图片历史记录 API 返回的数据结构
export interface GenerationHistoryResponse {
  count: number;
  list: GenerationHistoryItem[];
  total_page: number;
}

// 按日期分组类型
export interface GroupedHistoryItem {
  date: string;
  items: GenerationHistoryItem[];
}

// 定义积分记录项的类型
export interface TimesLogItem {
  id: number;
  user_id: number;
  change_type: string;
  use_limit: number;
  created_at: number;
  updated_at: number;
}

// 定义积分记录 API 返回的数据结构
export interface TimesLogResponse {
  count: number;
  list: TimesLogItem[];
  total_page: number;
}

// 定义支付记录项的类型
export interface PayLogItem {
  id: number;
  user_id: number;
  created_at: number;
  amount: number;
  currency: string;
  pay_type: string;
  price_id?: string;
  updated_at: number;
}

// 定义支付记录 API 返回的数据结构
export interface PayLogResponse {
  count: number;
  list: PayLogItem[];
  total_page: number;
}

// 定义订阅记录项的类型
export interface SubscriptionItem {
  id: number;
  pay_type: string;
  user_id: number;
  customer_id: string;
  subscription_id: string;
  price_id: string;
  created_at: number;
  updated_at: number;
  price_info: {
    id: number;
    appid: string;
    name: string;
    description: string;
    price: number;
    features: string;
    is_popular: number;
    button_text: string;
    usage_limit: number;
    level: number;
    stripe_id: number;
    prices_id: string;
    stripe_type: string;
    status: number;
  };
}

// 定义用户生成图片的接口
export interface GeneratedImage {
  id: string;
  imageUrl: string;
  createdAt: string;
}

// 统一弹窗表格样式类型
export interface DialogTableStyles {
  wrapper: string;
  table: string;
  headCell: string;
  cell: string;
  row: string;
  mono: string;
  pillBase: string;
}

