export class BaseUrls {

  public static readonly BASE_HREF: string = "http://localhost:8080";

  public static readonly ADMIN_GROUPURL: string = "adminauth";
  public static readonly USER_GROUPURL: string = "users";
  public static readonly SHIPMENT_GROUPURL: string = "shipments";
  public static readonly RESTAURANT_GROUPURL: string = "restaurants";
  public static readonly DISHES_GROUPURL: string = "dishes";
  public static readonly ORDER_GROUPURL: string = "orders";
  public static readonly ORDER_ITEMS_GROUPURL: string = "orderitems";

  public static getUrl(key: string): string { return `${this.BASE_HREF}/${key}/get`;}
  public static getAddUrl(key: string): string { return `${this.BASE_HREF}/${key}/add`;}
  public static getUpdateUrl(key: string): string { return `${this.BASE_HREF}/${key}/update`;}
  public static getDeleteUrl(key: string): string { return `${this.BASE_HREF}/${key}/delete`;}
  public static getLoginUrl(key: string): string { return `${this.BASE_HREF}/${key}/login`;}
  
}