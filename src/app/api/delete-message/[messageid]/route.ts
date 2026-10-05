import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {User} from "next-auth";

export async function DELETE(request:Request,{params}:{params:Promise<{messageid:string}>}){
    const {messageid} = await params;
    const messageId=messageid;
    await dbConnect();

      const session=await getServerSession(authOptions)
    const user:User=session?.user as User;

    if(!session || !session.user){
        return Response.json({
            success:false,
            message:"not authorised"
        },
    {
        status:401
    })
    }

    try {
     const updateResult= await UserModel.updateOne(
        {_id:user._id, "messages._id":messageId},
        {$set:{"messages.$.deletedByRecipient":true}}
      ) 

      if(updateResult.modifiedCount==0){
        return Response.json({
            success:false,
            message:"message not found or already deleted"
        },
    {
        status:404
    })
      }

      return Response.json({
        success:true,
        message:"message delete successfully"
      },
    {
        status:200
    })
    } 
    catch (error) {
        console.log("error",error)
         return Response.json({
        success:false,
        message:"error deleting messgage"
      },
    {
        status:500
    })
    }

  
}