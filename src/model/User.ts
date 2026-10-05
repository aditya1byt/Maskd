import mongoose,{Schema,Document, Types} from "mongoose";


export interface MessageModeration {
    flagged: boolean;
    action: 'allow' | 'flag' | 'block';
    categories: string[];
    scores: Record<string, number>;
    moderatedAt: Date;
}

 export interface Message extends Document{
    content:string;
    createdAt:Date;
    senderUserId?: Types.ObjectId;
    reply?:string;
    repliedAt?:Date;
    reaction?:string;
    deletedByRecipient?:boolean;
    moderation?:MessageModeration;
}

const MessageSchema:Schema<Message>= new Schema({
    content:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now
    },
    senderUserId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        default:null
    },
    reply:{
        type:String,
        default:null
    },
    repliedAt:{
        type:Date,
        default:null
    },
    reaction:{
        type:String,
        default:null
    },
    deletedByRecipient:{
        type:Boolean,
        default:false
    },
    moderation:{
        flagged:{type:Boolean},
        action:{type:String, enum:['allow','flag','block']},
        categories:[{type:String}],
        scores:{type:Schema.Types.Mixed},
        moderatedAt:{type:Date}
    }
})

export interface User extends Document{
    username:string;
    email:string;
    password:string;
    verifyCode:string;
    verifyCodeExpiry:Date;
    isVerified:boolean;
    isAcceptingMessages:boolean;
    messages:Message[]
}


const UserSchema :Schema<User>=new Schema({
    username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  verifyCode: {
    type: String,
    required: [true, 'Verify Code is required'],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, 'Verify Code Expiry is required'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
})
// In development, delete the cached model so schema changes take effect on hot-reload
if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.User;
}

const UserModel = mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User", UserSchema);

export default UserModel;