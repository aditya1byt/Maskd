import {z} from "zod";

export const acceptMessageSchema=z.object({
   acceptMessages :z.boolean() ,  //identifier is username
})