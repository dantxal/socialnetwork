import Express from 'express';
import graphqlHTTP from 'express-graphql';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Schema } from './schema/Schema';
import cors from 'cors';
import { IUser } from './modules/users/UserModel';
import { GraphQLError } from 'graphql';
import getUser from './auth';

console.log('olá');
console.log(path.resolve(__dirname, '/./../.env'));
console.log(path.join(__dirname, '/./../.env'));
dotenv.config({path: path.join(__dirname, '/./../.env')});
console.log(process.env.MONGODB_URL);

mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
const app = Express();
app.use(cors());

const graphQLHttpSettings = async (req: any) => {
    console.log(req.headers.authorization)
    const user: IUser = await getUser(req.headers.authorization);
    console.log(user);
    return {
        graphql: true,
        schema: Schema,
        context: {
            user,
            req
        },
        formatError: (error: GraphQLError) => {
            console.log(error.message);
            console.log(error.locations);
            console.log(error.stack);
            return {
                message: error.message,
                locations: error.locations,
                stack: error.stack
            }
        }
    }
}

app.use('/graphql', graphqlHTTP(graphQLHttpSettings));

export default app;