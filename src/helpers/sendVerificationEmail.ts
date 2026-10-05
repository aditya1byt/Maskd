import {resend} from "@/lib/resend"; 
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email:string,
    username:string,
    verifyCode:string
):Promise<ApiResponse>{
    try {

        await resend.emails.send({
            from:'onboarding@resend.dev',
            to:email,
            subject:"Maskd — Your verification code",
            react:VerificationEmail({username,otp:verifyCode}),

        })
          return {success:true, message:"message sent successfully "}
    }
     catch (emailError) {
        console.error("email cannot not be sent ",emailError)
        return {success:false, message:"failed to send verification email "}
    }
}