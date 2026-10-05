import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Not authorized" },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Prune sender link for messages older than 30 days
    try {
      await UserModel.updateMany(
        {
          "messages.senderUserId": userId,
          "messages.createdAt": { $lt: thirtyDaysAgo },
        },
        {
          $unset: { "messages.$[elem].senderUserId": "" },
        },
        {
          arrayFilters: [
            {
              "elem.senderUserId": userId,
              "elem.createdAt": { $lt: thirtyDaysAgo },
            },
          ],
        }
      );
    } catch (cleanupError) {
      console.warn("Could not cleanup expired sent messages:", cleanupError);
    }

    const sentMessages = await UserModel.aggregate([
      { $unwind: "$messages" },
      {
        $match: {
          "messages.senderUserId": userId,
          "messages.createdAt": { $gte: thirtyDaysAgo },
        },
      },
      { $sort: { "messages.createdAt": -1 } },
      {
        $project: {
          _id: 0,
          recipientUsername: "$username",
          messageId: "$messages._id",
          content: "$messages.content",
          createdAt: "$messages.createdAt",
          reply: "$messages.reply",
          repliedAt: "$messages.repliedAt",
          reaction: "$messages.reaction",
        },
      },
    ]);

    return Response.json(
      { success: true, sentMessages },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error fetching sent messages:", error);
    return Response.json(
      { success: false, message: "Error fetching sent messages" },
      { status: 500 }
    );
  }
}

