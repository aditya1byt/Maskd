import {z} from "zod";

export const messageSchema=z.object({
    content:z.string()  //identifier is username
             .min(10,{message:"atleast 10 characters are required"})
             .max(300,{message:"atmost 300 characters are allowed"})
})