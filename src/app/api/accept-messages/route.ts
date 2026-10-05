import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {User} from "next-auth"


export async function POST(request:Request){
    await dbConnect()
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
    const userId=user._id
    const {acceptingMessages}=await request.json()


    try {
        const updatedUser=await UserModel.findByIdAndUpdate(
            userId,{isAcceptingMessages:acceptingMessages},
            {new:true}
        )
        if(!updatedUser){
            return Response.json({
                success:false,
                message:"failed to update the stus of the user"
            },
        {
            status:401
        })
        }
 return Response.json({
                success:true,
                message:"status updated successfully",updatedUser
            },
        {
            status:201
        })

    } 
    catch (error) {
        console.log("failed to update user status")
         return Response.json({
         success:false,
         message:"failed to update user status"
        },
    {
        status:500
    })
    }


}

export async function GET(request:Request){
    await dbConnect()
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
    const userId=user._id;
    try{
        const foundUser=await UserModel.findById(userId);
    if(!foundUser){
        return Response.json({
            success:false,
            message:"unable to find the user"
        },
    {
        status:500
    })
    }
     return Response.json({
            success:true,
            isAcceptingMessages:foundUser.isAcceptingMessages
        },
    {
        status:200
    })
    ;
    }
    catch{
         console.log("failed to update user status")
         return Response.json({
         success:false,
         message:"failed to update user status"
        },
    {
        status:500
    })
    }
}