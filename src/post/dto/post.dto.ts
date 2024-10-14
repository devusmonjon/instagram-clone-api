import { Types } from "mongoose";
import { User } from "src/user/user.model";

export interface Post {
    owner: Types.ObjectId | User; // owner - foydalanuvchi
    content: string; // asosiy kontent
    content_alt: string; // qo'shimcha kontent
    caption: string; // post sarlavhasi
    private: boolean; // maxfiylik holati
    deleted?: boolean; // o'chirilgan holati
    published?: boolean; // nashr qilingan holati
    show_likes?: boolean; // layklar ko'rsatilishini boshqarish
    comments_enabled?: boolean; // kommentlar yoqilganligini boshqarish
    likes_count?: number; // layklar soni
    comments_count?: number; // kommentlar soni
    shares_count?: number; // ulashishlar soni
    views_count?: number; // ko'rishlar soni
    location?: string; // joylashuv
  }