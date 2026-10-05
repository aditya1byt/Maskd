import {z} from 'zod';


export const usernameValidation=z
.string()

.regex(/^[a-zA-Z0-9]{3,16}$/,"username should not contain special characters")


export const signUpSchema=z.object({
    username:usernameValidation,
    email:z.email({message:"invalid email address"}),
    password:z.string().min(6,{message:"password must be atleast 6 characters"})
})