import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ messageid: string }> }
) {
  const { messageid } = await params;
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Not authorized" },
      { status: 401 }
    );
  }

  try {
    const { reply, reaction } = await request.json();

    if (!reply && !reaction) {
      return Response.json(
        { success: false, message: "Reply text or reaction is required" },
        { status: 400 }
      );
    }

    // Build the update object — only update fields that are provided
    const updateFields: Record<string, any> = {};
    if (reply) {
      updateFields["messages.$.reply"] = reply;
      updateFields["messages.$.repliedAt"] = new Date();
    }
    if (reaction) {
      updateFields["messages.$.reaction"] = reaction;
    }

    const result = await UserModel.updateOne(
      { _id: user._id, "messages._id": messageid },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return Response.json(
        { success: false, message: "Message not found or not yours" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Reply sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error replying to message:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
