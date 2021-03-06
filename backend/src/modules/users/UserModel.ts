import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';


export interface IUser extends mongoose.Document {
    name: string;
    password: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    tokens:[{token: string}];
    friends: string[];
    posts: string[];
    generateAuthToken(): string;
    verifyAuthToken(): void;
}

export interface IUserModel extends mongoose.Model<IUser>{
    findByCredentials(email: string, password: string): IUser;
    findByToken(token: string): IUser
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 7
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    tokens: [{
        token: {
            type: String,
            required: false
        }
    }],
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]
}, {
    timestamps: true
});

userSchema.pre<IUser>('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

userSchema.methods.generateAuthToken = async function() {
    const token = jsonwebtoken.sign({_id: this._id}, process.env.JWT_KEY, {expiresIn: 60 * 30});
    this.tokens = [{token}].concat(this.tokens);
    this.save();
    return token;
}

userSchema.methods.verifyAuthToken = function(callbackSuccess?: () => {}, callbackError?: (error: any) => {}) {
    const actualToken = this.tokens[0].token;
    try {
        jsonwebtoken.verify(actualToken, process.env.JWT_KEY);
        if (callbackSuccess) {
            callbackSuccess();
        }
    } catch (err) {
        if (callbackError) {
            callbackError(err);
        }
    }
}

userSchema.statics.findByCredentials = async (email: string, password: string) => {
    const user = await User.findOne({email});
    if (!user) {
        throw new Error('Invalid login credentials');
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error('Invalid password');
    }

    return user;
}

userSchema.statics.findByToken = async (token: string) => {
    const jsonPayload: any = jsonwebtoken.decode(token);
    const user = await User.findOne({_id: jsonPayload._id});

    return user;
}

const User = mongoose.model<IUser, IUserModel>('User_SocialNetwork', userSchema);


export default User;