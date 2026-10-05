import {z} from "zod";

export const signInSchema=z.object({
    identifier:z.string() ,  //identifier is username
    password:z.string(),
})