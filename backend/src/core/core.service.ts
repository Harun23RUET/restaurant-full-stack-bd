import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CoreService {
  constructor(private readonly prisma: PrismaService) {}
  private req(ok:boolean,msg:string){if(!ok)throw new NotFoundException(msg)}

  async reviews(s?:string){return this.prisma.review.findMany({where:s?{status:s as any}:undefined,include:{customer:true,order:true,reminders:true},orderBy:{createdAt:'desc'}})}
  async review(id:string){const x=await this.prisma.review.findUnique({where:{id},include:{customer:true,order:true,reminders:true}});this.req(!!x,'Review not found');return x}
  async createReview(b:any){this.req(!!await this.prisma.customer.findUnique({where:{id:b.customerId}}),'Customer not found');this.req(!!await this.prisma.order.findUnique({where:{id:b.orderId}}),'Order not found');return this.prisma.review.create({data:{customerId:b.customerId,orderId:b.orderId,foodRating:+b.foodRating,serviceRating:+b.serviceRating,deliveryRating:+b.deliveryRating,comment:b.comment,status:b.status as any},include:{customer:true,order:true,reminders:true}})}
  async updateReview(id:string,b:any){await this.review(id);return this.prisma.review.update({where:{id},data:{...(b.foodRating!==undefined&&{foodRating:+b.foodRating}),...(b.serviceRating!==undefined&&{serviceRating:+b.serviceRating}),...(b.deliveryRating!==undefined&&{deliveryRating:+b.deliveryRating}),...(b.comment!==undefined&&{comment:b.comment}),...(b.status!==undefined&&{status:b.status as any})}})}
  async deleteReview(id:string){await this.review(id);return this.prisma.review.delete({where:{id}})}

  async reminders(){return this.prisma.reviewReminder.findMany({include:{review:true},orderBy:{createdAt:'desc'}})}
  async reminder(id:string){const x=await this.prisma.reviewReminder.findUnique({where:{id},include:{review:true}});this.req(!!x,'Review reminder not found');return x}
  async createReminder(b:any){this.req(!!await this.prisma.review.findUnique({where:{orderId:b.orderId}}),'Review not found for this order');return this.prisma.reviewReminder.create({data:{orderId:b.orderId,customerId:b.customerId,reminderNumber:+b.reminderNumber,status:b.status??'PENDING',sentAt:b.sentAt?new Date(b.sentAt):undefined}})}
  async updateReminder(id:string,b:any){await this.reminder(id);return this.prisma.reviewReminder.update({where:{id},data:{...(b.status!==undefined&&{status:b.status}),...(b.sentAt!==undefined&&{sentAt:b.sentAt?new Date(b.sentAt):null})}})}
  async deleteReminder(id:string){await this.reminder(id);return this.prisma.reviewReminder.delete({where:{id}})}

  async favourites(customerId:string){return this.prisma.favourite.findMany({where:{customerId},include:{menuItem:true},orderBy:{createdAt:'desc'}})}
  async addFavourite(b:any){this.req(!!await this.prisma.customer.findUnique({where:{id:b.customerId}}),'Customer not found');this.req(!!await this.prisma.menuItem.findUnique({where:{id:b.menuItemId}}),'Menu item not found');return this.prisma.favourite.upsert({where:{customerId_menuItemId:{customerId:b.customerId,menuItemId:b.menuItemId}},update:{},create:{customerId:b.customerId,menuItemId:b.menuItemId},include:{menuItem:true}})}
  async deleteFavourite(c:string,m:string){return this.prisma.favourite.delete({where:{customerId_menuItemId:{customerId:c,menuItemId:m}}})}

  async notifications(s?:string){return this.prisma.notification.findMany({where:s?{status:s as any}:undefined,orderBy:{createdAt:'desc'}})}
  async notification(id:string){const x=await this.prisma.notification.findUnique({where:{id}});this.req(!!x,'Notification not found');return x}
  async createNotification(b:any){return this.prisma.notification.create({data:{userId:b.userId,customerId:b.customerId,orderId:b.orderId,type:b.type,title:b.title,message:b.message,channel:b.channel as any,status:b.status as any}})}
  async updateNotification(id:string,b:any){await this.notification(id);return this.prisma.notification.update({where:{id},data:{...(b.type!==undefined&&{type:b.type}),...(b.title!==undefined&&{title:b.title}),...(b.message!==undefined&&{message:b.message}),...(b.channel!==undefined&&{channel:b.channel as any}),...(b.status!==undefined&&{status:b.status as any}),...(b.sentAt!==undefined&&{sentAt:b.sentAt?new Date(b.sentAt):null})}})}
  async deleteNotification(id:string){await this.notification(id);return this.prisma.notification.delete({where:{id}})}

  async gallery(active?:string){return this.prisma.galleryItem.findMany({where:active===undefined?undefined:{isActive:active==='true'},orderBy:[{sortOrder:'asc'},{createdAt:'desc'}]})}
  async galleryItem(id:string){const x=await this.prisma.galleryItem.findUnique({where:{id}});this.req(!!x,'Gallery item not found');return x}
  async createGallery(b:any){return this.prisma.galleryItem.create({data:{title:b.title,imageUrl:b.imageUrl,category:b.category,sortOrder:b.sortOrder===undefined?undefined:+b.sortOrder,isActive:b.isActive}})}
  async updateGallery(id:string,b:any){await this.galleryItem(id);return this.prisma.galleryItem.update({where:{id},data:{...(b.title!==undefined&&{title:b.title}),...(b.imageUrl!==undefined&&{imageUrl:b.imageUrl}),...(b.category!==undefined&&{category:b.category}),...(b.sortOrder!==undefined&&{sortOrder:+b.sortOrder}),...(b.isActive!==undefined&&{isActive:b.isActive})}})}
  async deleteGallery(id:string){await this.galleryItem(id);return this.prisma.galleryItem.delete({where:{id}})}

  async contacts(s?:string){return this.prisma.contactMessage.findMany({where:s?{status:s}:undefined,orderBy:{createdAt:'desc'}})}
  async contact(id:string){const x=await this.prisma.contactMessage.findUnique({where:{id}});this.req(!!x,'Contact message not found');return x}
  async createContact(b:any){return this.prisma.contactMessage.create({data:{name:b.name,email:b.email,phone:b.phone,subject:b.subject,message:b.message,status:b.status??'NEW'}})}
  async updateContact(id:string,b:any){await this.contact(id);return this.prisma.contactMessage.update({where:{id},data:{...(b.name!==undefined&&{name:b.name}),...(b.email!==undefined&&{email:b.email}),...(b.phone!==undefined&&{phone:b.phone}),...(b.subject!==undefined&&{subject:b.subject}),...(b.message!==undefined&&{message:b.message}),...(b.status!==undefined&&{status:b.status})}})}
  async deleteContact(id:string){await this.contact(id);return this.prisma.contactMessage.delete({where:{id}})}

  async faqs(active?:string){return this.prisma.aIFAQ.findMany({where:active===undefined?undefined:{isActive:active==='true'},orderBy:{createdAt:'desc'}})}
  async faq(id:string){const x=await this.prisma.aIFAQ.findUnique({where:{id}});this.req(!!x,'AI FAQ not found');return x}
  async createFaq(b:any){return this.prisma.aIFAQ.create({data:{question:b.question,answer:b.answer,category:b.category,isActive:b.isActive}})}
  async updateFaq(id:string,b:any){await this.faq(id);return this.prisma.aIFAQ.update({where:{id},data:{...(b.question!==undefined&&{question:b.question}),...(b.answer!==undefined&&{answer:b.answer}),...(b.category!==undefined&&{category:b.category}),...(b.isActive!==undefined&&{isActive:b.isActive})}})}
  async deleteFaq(id:string){await this.faq(id);return this.prisma.aIFAQ.delete({where:{id}})}

  async knowledge(approved?:string){return this.prisma.aIKnowledgeBase.findMany({where:approved===undefined?undefined:{isApproved:approved==='true'},orderBy:{createdAt:'desc'}})}
  async knowledgeItem(id:string){const x=await this.prisma.aIKnowledgeBase.findUnique({where:{id}});this.req(!!x,'AI knowledge item not found');return x}
  async createKnowledge(b:any){return this.prisma.aIKnowledgeBase.create({data:{title:b.title,content:b.content,sourceType:b.sourceType,isApproved:b.isApproved}})}
  async updateKnowledge(id:string,b:any){await this.knowledgeItem(id);return this.prisma.aIKnowledgeBase.update({where:{id},data:{...(b.title!==undefined&&{title:b.title}),...(b.content!==undefined&&{content:b.content}),...(b.sourceType!==undefined&&{sourceType:b.sourceType}),...(b.isApproved!==undefined&&{isApproved:b.isApproved})}})}
  async deleteKnowledge(id:string){await this.knowledgeItem(id);return this.prisma.aIKnowledgeBase.delete({where:{id}})}

  async audits(entity?:string){return this.prisma.auditLog.findMany({where:entity?{entity}:undefined,orderBy:{createdAt:'desc'}})}
  async audit(id:string){const x=await this.prisma.auditLog.findUnique({where:{id}});this.req(!!x,'Audit log not found');return x}
  async createAudit(b:any){return this.prisma.auditLog.create({data:{userId:b.userId,action:b.action,entity:b.entity,entityId:b.entityId,oldData:b.oldData,newData:b.newData,ipAddress:b.ipAddress}})}
  async deleteAudit(id:string){await this.audit(id);return this.prisma.auditLog.delete({where:{id}})}
}
