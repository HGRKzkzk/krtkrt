export type Visibility = 'kring' | 'buurt';
export type Kind = 'vraag' | 'aanbod' | 'gedachte';
export type Post = { id:string; author:string; kind:Kind; text:string; visibility:Visibility; circle:string; createdAt:number; link?:string; demo?:boolean };
export type Message = {id:string; author:string; text:string; channel:string; createdAt:number; demo?:boolean};
export type Connection = {id:string; from:string; to:string; reason:string; author:string; createdAt:number; demo?:boolean};