import React, { Suspense } from 'react';
import { useFragment } from 'react-relay/hooks';
import graphql from 'babel-plugin-relay/macro';

import { Comment, CommentCreation } from './';

const commentsTypeFragment = graphql`
    fragment CommentsTypeFragment on CommentListType {
        Comments {
            edges {
                ...CommentTypeFragment
            }
            pageInfo {
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
            }
        }
    }
`;

const Comments = ({comments}: {
    comments: any
}) => {
    const commentsTypeFragmentReturned = useFragment(commentsTypeFragment, comments);
    return (
        <div>
                {
                    commentsTypeFragmentReturned && commentsTypeFragmentReturned.Comments && commentsTypeFragmentReturned.Comments.edges ?
                    commentsTypeFragmentReturned.Comments.edges.map((edge: any, index: number) => (
                        <Suspense key={index} fallback="loading...">
                            <Comment comment={edge}/>
                        </Suspense>
                    )):
                    null
                }
        </div>
    );
};

export default Comments;