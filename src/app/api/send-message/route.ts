import UserModel from "@/model/User";
import dbConnect  from "@/lib/dbConnect";
import { Message } from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import { moderateMessage } from "@/lib/moderation";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request:Request){
    // ── Rate limit (IP-based, 5 requests per minute) ───────────────
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

    const rateLimitResult = checkRateLimit(ip, 5, 60 * 1000);
    if (!rateLimitResult.allowed) {
        return Response.json({
            success:false,
            message:"Too many messages. Please wait a moment before trying again."
        },
    {
        status:429
    })
    }

    await dbConnect();

   const {username,content}= await request.json();

   // ── Server-side content validation ─────────────────────────────
   if (!content || typeof content !== 'string') {
       return Response.json({
           success:false,
           message:"Message content is required"
       },
   {
       status:400
   })
   }

   const trimmedContent = content.trim();
   if (trimmedContent.length < 10 || trimmedContent.length > 300) {
       return Response.json({
           success:false,
           message:"Message must be between 10 and 300 characters"
       },
   {
       status:400
   })
   }

   // Check if sender is logged in — attach their ID for tracking (never exposed to recipient)
   const session = await getServerSession(authOptions);
   const senderUserId = session?.user?._id ? new mongoose.Types.ObjectId(session.user._id) : null;


    try {
      const user= await UserModel.findOne({username});
      
      if(!user){
        return Response.json({
            success:false,
            message:"user not found "
        },
    {
        status:404
    })
      }

      if(!user.isAcceptingMessages)
      {
         return Response.json({
            success:false,
            message:"User is not accepting messages "
        },
    {
        status:403
    })
      }

      // ── AI Moderation ──────────────────────────────────────────
      let moderationResult;
      try {
          moderationResult = await moderateMessage(trimmedContent);
      } catch (error) {
          console.error("Moderation service error:", error);
          return Response.json({
              success:false,
              message:"We couldn't verify your message right now. Please try again."
          },
      {
          status:503
      })
      }

      // Block harmful messages — don't save to DB
      if (moderationResult.action === 'block') {
          return Response.json({
              success:false,
              message:"Your message couldn't be sent because it may violate our community guidelines.",
              code:"MODERATION_BLOCKED"
          },
      {
          status:400
      })
      }

      // ── Save message (ALLOW and FLAG both get saved) ───────────
      const newMessage={content: trimmedContent, createdAt:new Date(), senderUserId, moderation: moderationResult};
      user.messages.push(newMessage as Message)

      await user.save()

      const savedMessage = user.messages[user.messages.length - 1];

    return Response.json({
            success:true,
            message:"message sent successfully",
            messageId: savedMessage._id
        },
    {
        status:200
    })
      
    }
     catch (error) {
         console.log("error adding messages",error);
        return Response.json({
            success:false,
            message:"internal server error"
        },
        {
            status:500
        }
    )
    }
}