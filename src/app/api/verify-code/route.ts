import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request:Request){
    await dbConnect();

    try {
       const{username,code}=await request.json()
       
       const decodedUsername=decodeURIComponent(username);

       const user = await UserModel.findOne({username});
       if(!user){
        return Response.json({
            success:false,
            message:"user not found"
        },
        {
        status:500
        }
      )

    }

    const isValidCode=user.verifyCode===code;

    const isCodeNotExpired=new Date(user.verifyCodeExpiry)>new Date()

    if(isValidCode &&  isCodeNotExpired){
        user.isVerified=true

        await user.save()
          return Response.json({
            success:true,
            message:"account verified successfully"
        },
        {
        status:200
        }
      )

    }

    else if(!isCodeNotExpired){
                   return Response.json({
            success:false,
            message:"verification code has expired , please signup again"
        },
        {
        status:400
        }
      )
    }

    else{
         return Response.json({
            success:false,
            message:"incorrect verification code"
        },
        {
        status:400
        }
      )
    }
 } 
    
    catch (error) {
         console.error("error verifying the user",error)
       return Response.json({
        success:false,
        message:"error verifying username"
       },
    {
        status:500
    }
     )
    }
}